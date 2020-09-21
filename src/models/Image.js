const { Schema, model } = require("mongoose");

/**
 * @swagger
 * definition:
 *   Image:
 *     type: object
 *     required:
 *     - src
 *     properties:
 *     - src:
 *         type: string
 *     - filename:
 *         type: string
 *
 */
const schema = new Schema({
  src: { type: String, required: true },
  filename: { type: String, required: false }
});

module.exports = model("Image", schema);
