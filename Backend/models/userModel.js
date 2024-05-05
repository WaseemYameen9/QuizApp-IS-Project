const { verify } = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  verificationCode: { type: String },
  role: { type: String, enum: ["teacher", "student", "admin"], required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
