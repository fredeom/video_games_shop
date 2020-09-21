const jwt = require("jsonwebtoken");
const path = require("path");

const config = require("./config");

const mongoose = require("mongoose");
const User = require("./models/User");
const Game = require("./models/Game");
const Category = require("./models/Category");
const Order = require("./models/Order");
const Image = require("./models/Image");

const auth = (req, res, next) => {
  if (
    req.hasOwnProperty("headers") &&
    req.headers.hasOwnProperty("authorization")
  ) {
    try {
      req.user = jwt.verify(req.headers["authorization"], config.JWT_SECRET);
    } catch (err) {}
  }
  next();
};

const setupApi = (app) => {
  /**
   * @swagger
   * tags:
   *   - name: user
   *     description: Related to users
   *   - name: game
   *     description: Related to video games
   *   - name: category
   *     description: Related to video game categories
   *   - name: order
   *     description: Access to video game store orders
   *
   * securityDefinitions:
   *   JWT:
   *     description: "Use jwt string without any other additions like bearer"
   *     type: apiKey
   *     name: Authorization
   *     in: header
   *
   */

  /**
   * @swagger
   * /image/upload:
   *   post:
   *     tags:
   *     - image
   *     description: Use to upload image on server
   *     parameters:
   *     - name: image
   *       in: formData
   *       description: Image to Upload
   *       required: true
   *       type: file
   *     responses:
   *       '200':
   *         description: Image uploaded
   *       '500':
   *         description: Image upload failed
   */
  app.post("/api/image/upload", (req, res) => {
    if (req.files) {
      const file = req.files.image,
        filename = file.name;
      file.mv(
        path.join(__dirname, "./public/imgs/" + filename),
        async (error) => {
          if (error) {
            res.status(500).json({ error: "Fail to upload file" });
          } else {
            const imageSrc =
              "http://" + req.headers.host + "/imgs/" + filename;
            const image = new Image({ src: imageSrc, filename });
            await image.save();
            res.status(200).json({ status: "ok" });
          }
        }
      );
    }
  });

  /**
   * @swagger
   * /image/list:
   *   get:
   *     tags:
   *     - image
   *     description: Use to list image objects on server
   *     produces:
   *     - application/json
   *     responses:
   *       '200':
   *         description: Operation succeeded
   */
  app.get("/api/image/list", async (req, res) => {
    const images = await Image.find({});
    res.status(200).json(images);
  });

  /**
   * @swagger
   * /image/{imageId}:
   *   delete:
   *     security:
   *       - JWT: []
   *     tags:
   *     - image
   *     description: Use to delete image object from server
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: imageId
   *       in: path
   *       required: true
   *       type: string
   *     responses:
   *       '200':
   *         description: Image object successfully deleted
   *       '401':
   *         description: Bad image object id specified
   *       '403':
   *         description: Only admin could remove image objects from server
   *
   *
   */
  app.delete("/api/image/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could delete image objects" });
    }
    try {
      const image = Image.findById(req.params.id);
      if (image) {
        console.log(image.filename);
        await Image.deleteOne({ _id: req.params.id });
      }
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad image id specified" });
    }
  });

  /**
   * @swagger
   * /user/register:
   *   post:
   *     tags:
   *     - user
   *     description: Use to register new non-admin users
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: body
   *       in: body
   *       description: User object that needs to be logged in
   *       required: true
   *       schema:
   *          type: object
   *          properties:
   *            login:
   *              type: string
   *              required: true
   *            name:
   *              type: string
   *              required: true
   *            password:
   *              type: string
   *              required: true
   *     responses:
   *       '401':
   *         description: login/name/password fields can't be empty
   *       '200':
   *         description: Successfully logged in
   */
  app.post("/api/user/register", async (req, res) => {
    const login = req.body.login;
    const name = req.body.name;
    const password = req.body.password;
    if (!login || !name || !password) {
      res
        .status(401)
        .json({ error: "login, name, password fields can't be empty" });
      return;
    }
    const user = new User({ login, name, password });
    await user.save();
    res.json({ status: "ok" });
  });

  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *     - user
   *     description: Use to login and get jwt token
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     -  in: body
   *        name: body
   *        description: User object that needs to be logged in
   *        required: true
   *        schema:
   *          #$ref: "#/definitions/User"
   *          type: object
   *          properties:
   *            login:
   *              type: string
   *            password:
   *              type: string
   *     responses:
   *       '401':
   *         description: Can't find user with such login/password pair
   *       '200':
   *         description: Successfully logged in
   */
  app.post("/api/user/login", async (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    const user = await User.findOne({ login, password });
    if (!user) {
      res
        .status(401)
        .json({ error: "Can't find user with such login/password" });
      return;
    }
    res.status(200).json({
      login: user.login,
      admin: user.admin,
      jwt: jwt.sign(
        {
          login: user.login,
          admin: user.admin
        },
        config.JWT_SECRET,
        { expiresIn: 60 * 60 }
      )
    });
  });

  /**
   * @swagger
   * /user/list:
   *   get:
   *     security:
   *       - JWT: []
   *     tags:
   *     - user
   *     description: Use to request all users
   *     produces:
   *     - application/json
   *     responses:
   *       '200':
   *         description: A list of users
   *       '500':
   *         description: Fail to query users
   */
  app.get("/api/user/list", auth, async (req, res) => {
    if (!req.user) {
      res.status(200).json([]);
      return;
    }
    const query = req.user.admin ? {} : { login: req.user.login };
    try {
      let users = await User.find(query);
      const hideOnePassword = (user) => {
        const r = {};
        for (let field of ["_id", "login", "admin", "name"]) {
          r[field] = user[field];
        }
        return r;
      };
      res.status(200).json(users.map(hideOnePassword));
    } catch (e) {
      res.status(500).json({ error: "Failed to query users" });
    }
  });

  /**
   * @swagger
   * /game/list:
   *   get:
   *     tags:
   *     - game
   *     description: Use to request all games
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: minprice
   *       in: query
   *       description: Set filter for minimum price on video game to show
   *       required: false
   *       type: number
   *     - name: maxprice
   *       in: query
   *       description: Set filter for maximum price on video game to show
   *       required: false
   *       type: number
   *     - name: selectedCategory
   *       in: query
   *       description: Set filter for selected category id of video game to show
   *       type: string
   *     responses:
   *       '200':
   *         description: A list of games
   */
  app.get("/api/game/list", async (req, res) => {
    const query = {};
    if (req.query && (!!req.query.minprice || !!req.query.maxprice)) {
      query.price = {};
    }
    if (req.query && !!req.query.minprice)
      query.price.$gte = req.query.minprice;
    if (req.query && !!req.query.maxprice)
      query.price.$lte = req.query.maxprice;
    if (req.query && req.query.selectedCategory)
      query.category = req.query.selectedCategory;
    const games = await Game.find(query);
    res.json(games);
  });

  /**
   * @swagger
   * /game/add:
   *   post:
   *     security:
   *       - JWT: []
   *     tags:
   *     - game
   *     description: Use to add new game
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     -  in: body
   *        name: body
   *        description:  Video Game object that needs to be added to the store
   *        required: true
   *        schema:
   *          $ref: "#/definitions/Game"
   *     responses:
   *       '403':
   *         description: No permission
   *       '401':
   *         description: Some game properties missing
   *       '500':
   *         description: Unknown server error
   *       '200':
   *         description: Video Game object added
   */
  app.post("/api/game/add", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could add video games" });
      return;
    }

    if (!req.body || !req.body.title || !req.body.price) {
      res.status(401).json({ error: "Some game properties missing" });
      return;
    }
    try {
      const game = new Game({
        title: req.body.title,
        price: req.body.price,
        category: req.body.category
      });
      await game.save();
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ error: "Unknown troubles" });
    }
  });

  /**
   * @swagger
   * /game/{gameId}:
   *   put:
   *     security:
   *       - JWT: []
   *     tags:
   *     - game
   *     description: Use to update a Video Game
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: gameId
   *       in: path
   *       description: Game Id to update
   *       required: true
   *       type: string
   *     - name: body
   *       in: body
   *       description:  Video Game object that needs to be updated
   *       required: true
   *       schema:
   *         $ref: "#/definitions/Game"
   *     responses:
   *       '401':
   *         description: Bad video game Id or some video game properties missing
   *       '403':
   *         description: No permission
   *       '200':
   *         description: Game successfully updated
   */
  app.put("/api/game/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could update video games" });
      return;
    }
    if (!req.body || !req.body.title || !req.body.price) {
      res.status(401).json({ error: "Some game properties missing" });
      return;
    }
    try {
      await Game.updateOne(
        { _id: req.params.id },
        { $set: req.body },
        { upsert: true }
      );
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad game id given" });
    }
  });

  /**
   * @swagger
   * /game/{gameId}:
   *   delete:
   *     security:
   *       - JWT: []
   *     tags:
   *     - game
   *     description: Use to delete a Video Game
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: gameId
   *       in: path
   *       description: Game Id to delete
   *       required: true
   *       type: string
   *     responses:
   *       '401':
   *         description: Bad game Id
   *       '403':
   *         description: No permission
   *       '200':
   *         description: Game successfully removed
   *
   */
  app.delete("/api/game/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could delete video games" });
      return;
    }
    try {
      await Game.deleteOne({ _id: req.params.id });
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad game id given" });
    }
  });

  //////////////////////////////////////////////////////////////////////////
  /**
   * @swagger
   * /category/list:
   *   get:
   *     tags:
   *     - category
   *     description: Use to request all video game categories
   *     responses:
   *       '200':
   *         description: A list of video game categories
   */
  app.get("/api/category/list", async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
  });

  /**
   * @swagger
   * /category/add:
   *   post:
   *     security:
   *       - JWT: []
   *     tags:
   *     - category
   *     description: Use to add new video game category
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     -  in: body
   *        name: body
   *        description:  Video Game Category object that needs to be added to the store
   *        required: true
   *        schema:
   *          $ref: "#/definitions/Category"
   *     responses:
   *       '403':
   *         description: No permission
   *       '401':
   *         description: Some video game category properties missing
   *       '500':
   *         description: Unknown server error
   *       '200':
   *         description: Video Game object added
   */
  app.post("/api/category/add", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res
        .status(403)
        .json({ error: "Only admin could add video game categories" });
      return;
    }

    if (!req.body || !req.body.title) {
      res
        .status(401)
        .json({ error: "Some video game category properties missing" });
      return;
    }
    try {
      const category = new Category({
        title: req.body.title
      });
      await category.save();
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ error: "Unknown troubles" });
    }
  });

  /**
   * @swagger
   * /category/{categoryId}:
   *   put:
   *     security:
   *       - JWT: []
   *     tags:
   *     - category
   *     description: Use to update a Video Game Category
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: categoryId
   *       in: path
   *       description: Game Category Id to update
   *       required: true
   *       type: string
   *     - name: body
   *       in: body
   *       description:  Video Game Category object that needs to be updated
   *       required: true
   *       schema:
   *         $ref: "#/definitions/Category"
   *     responses:
   *       '401':
   *         description: Bad video game category Id or some properties missing
   *       '200':
   *         description: Video Game Category successfully updated
   *       '403':
   *         description: No permission
   */
  app.put("/api/category/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res
        .status(403)
        .json({ error: "Only admin could update video game categories" });
      return;
    }
    if (!req.body || !req.body.title) {
      res
        .status(401)
        .json({ error: "Some video game category properties missing" });
      return;
    }
    try {
      await Category.updateOne(
        { _id: req.params.id },
        { $set: req.body },
        { upsert: true }
      );
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad video game category id given" });
    }
  });

  /**
   * @swagger
   * /category/{categoryId}:
   *   delete:
   *     security:
   *       - JWT: []
   *     tags:
   *     - category
   *     description: Use to delete a Video Game Category
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: categoryId
   *       in: path
   *       description: Video Game Category Id to delete
   *       required: true
   *       type: string
   *     responses:
   *       '401':
   *         description: Bad video game category Id
   *       '200':
   *         description: Video Game Category successfully removed
   *       '403':
   *         description: No permission
   *
   */
  app.delete("/api/category/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could delete video games" });
      return;
    }
    try {
      await Category.deleteOne({ _id: req.params.id });
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad video game category id given" });
    }
  });

  //////////////////////////////////////////////////////////////
  /**
   * @swagger
   * /order/list:
   *   get:
   *     security:
   *       - JWT: []
   *     tags:
   *     - order
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: ext
   *       in: query
   *       required: false
   *       type: boolean
   *     responses:
   *       '200':
   *         description: A list of users
   *       '500':
   *         description: Fail to query users
   */
  app.get("/api/order/list", auth, async (req, res) => {
    if (!req.user) {
      res.status(200).json([]);
      return;
    }
    const query = req.user.admin ? {} : { user: req.user.login };
    try {
      let orders = await Order.find(query);
      if (req.query.ext === "true") {
        const users = await Promise.all(
          orders.map((order) => {
            return User.findOne({ login: order.user });
          })
        );
        const gameArrs = await Promise.all(
          orders.map((order) => {
            return Game.find({
              _id: {
                $in: order.games.map((gameId) =>
                  mongoose.Types.ObjectId(gameId)
                )
              }
            });
          })
        );

        orders = orders.map((o, i) => {
          return {
            _id: o._id,
            user: o.user,
            games: o.games,
            username: users[i].name,
            total: gameArrs[i].map((g) => g.price).reduce((a, x) => a + x, 0)
          };
        });
      }
      res.status(200).json(orders);
    } catch (e) {
      res.status(500).json({ error: "Failed to query orders" });
    }
  });

  /**
   * @swagger
   * /order/add:
   *   post:
   *     security:
   *       - JWT: []
   *     tags:
   *     - order
   *     description: Use to add new order
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     -  in: body
   *        name: body
   *        description:  Order object that needs to be added to the store
   *        required: true
   *        schema:
   *          $ref: "#/definitions/Order"
   *     responses:
   *       '403':
   *         description: No permission
   *       '401':
   *         description: Some order properties missing
   *       '500':
   *         description: Unknown server error
   *       '200':
   *         description: Order object added
   */
  app.post("/api/order/add", auth, async (req, res) => {
    if (!req.user) {
      res.status(403).json({ error: "Only authorized user could add order" });
      return;
    }

    if (!req.body || !req.body.user || !req.body.games) {
      res.status(401).json({ error: "Some order properties missing" });
      return;
    }
    try {
      const order = new Order({
        user: req.body.user,
        games: req.body.games
      });
      await order.save();
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ error: "Unknown errors" });
    }
  });

  /**
   * @swagger
   * /order/{orderId}:
   *   put:
   *     security:
   *       - JWT: []
   *     tags:
   *     - order
   *     description: Use to update an order
   *     consumes:
   *     - application/json
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: orderId
   *       in: path
   *       description: Order Id to update
   *       required: true
   *       type: string
   *     - name: body
   *       in: body
   *       description:  Order object that needs to be updated
   *       required: true
   *       schema:
   *         $ref: "#/definitions/Order"
   *     responses:
   *       '401':
   *         description: Order Id or some properties missing
   *       '200':
   *         description: Order successfully updated
   *       '403':
   *         description: No permission
   */
  app.put("/api/order/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could update orders" });
      return;
    }
    if (!req.body || !req.body.user || !req.body.games) {
      res.status(401).json({ error: "Some order properties missing" });
      return;
    }
    try {
      await Order.updateOne(
        { _id: req.params.id },
        { $set: req.body },
        { upsert: true }
      );
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad order id given" });
    }
  });

  /**
   * @swagger
   * /order/{orderId}:
   *   delete:
   *     security:
   *       - JWT: []
   *     tags:
   *     - order
   *     description: Use to delete an Order
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: orderId
   *       in: path
   *       description: Order Id to delete
   *       required: true
   *       type: string
   *     responses:
   *       '401':
   *         description: Bad order Id
   *       '200':
   *         description: Order successfully removed
   *       '403':
   *         description: No permission
   *
   */
  app.delete("/api/order/:id", auth, async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: "Only admin could delete orders" });
      return;
    }
    try {
      await Order.deleteOne({ _id: req.params.id });
      res.status(200).json({ status: "ok" });
    } catch (e) {
      res.status(401).json({ error: "Bad order id given" });
    }
  });
};

module.exports = setupApi;
