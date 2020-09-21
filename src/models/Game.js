const { Schema, model } = require("mongoose");

/**
 * @swagger
 * definition:
 *   Game:
 *     type: object
 *     required:
 *     - title
 *     - price
 *     properties:
 *       title:
 *         type: string
 *       price:
 *         type: number
 *       category:
 *         type: string
 *       image:
 *         type: string
 */
const schema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: false },
  image: { type: String, required: false }
});

module.exports = model("Game", schema);
