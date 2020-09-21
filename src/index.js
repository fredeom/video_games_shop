const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const setupApi = require("./setupApi");
const config = require("./config");

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 8080;

const start = async () => {
  try {
    await mongoose.connect(config.MONGO_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (e) {
    console.log(e);
  }
};

start();

const app = express();

/////////////////   Swagger stuff   /////////////////////
const swaggerDefinition = {
  info: {
    version: "1.0.0",
    title: "Video Games Store (test)",
    description:
      "You can test api here or run site directly (http://localhost:8080).\n" +
      "Use login 'test' and password 'test' for non admin duties\n" +
      "and login 'admin' with password 'admin' for admin privileges.\n" +
      "You can also register your users only without admin privileges.\n\n" +
      "After registration with POST /user/register you could use POST /user/login to get JWT_TOCKEN\n\n" +
      'Set jwt field value (e.g. "eyJh****J9.eyJs****MTk4fQ.NdLg6****31_mqOs") in window by clicking Authorize button on the right of this description.\n\n' +
      "ONLY JWT_TOKEN SHOULD BE USED! NO NEED IN 'BEARER' STRING!\n\n" +
      "Thank you for understanding and have a good time with api!!!"
  },
  host: ["doesn.sse.codesandbox.io"],
  basePath: "/api/"
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, "setupApi.js"),
    path.join(__dirname, "models/*.js")
  ]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
//////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

setupApi(app);

app.listen(PORT, () => console.log("server started"));
