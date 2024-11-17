const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  UserName : { type: String, required: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  email: { type: String, required: true },
  age : { type: Number, required: true },
  gender : { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

module.exports = mongoose.model('Users', userSchema);
