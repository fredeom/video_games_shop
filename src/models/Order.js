const { Schema, model } = require("mongoose");

/**
 * @swagger
 * definition:
 *   Order:
 *     type: object
 *     required:
 *     - user
 *     - games
 *     properties:
 *       user:
 *         type: string
 *       games:
 *         type: array
 *         items:
 *            type: string
 */
const schema = new Schema({
  user: { type: String, required: true },
  games: { type: [String], required: true }
});

module.exports = model("Order", schema);
