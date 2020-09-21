const { Schema, model } = require("mongoose");

/**
 * @swagger
 * definition:
 *   Category:
 *     type: object
 *     required:
 *     - title
 *     properties:
 *       title:
 *         type: string
 *       image:
 *         type: string
 */
const schema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: false }
});

module.exports = model("Category", schema);
