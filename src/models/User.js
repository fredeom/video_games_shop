const { Schema, model } = require("mongoose");

/**
 * @swagger
 * definition:
 *   User:
 *     type: object
 *     required:
 *     - login
 *     - name
 *     - password
 *     properties:
 *       login:
 *         type: string
 *       name:
 *         type: string
 *       password:
 *         type: string
 *       admin:
 *         type: boolean
 */
const schema = new Schema({
  login: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false }
});

module.exports = model("User", schema);
