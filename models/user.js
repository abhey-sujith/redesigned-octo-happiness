var mongoose = require("mongoose");
const { isEmail } = require('validator');
var bcrypt = require("bcrypt");
const roles = require("../config")

function validator (val) {
  if(roles.roles.includes(val))
    return true
  else
    return false
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  role: {
    type: String,
    required: [true, 'Please enter a role'],
    validate: [validator,'Please enter a valid role']
  }
},{timestamps:true});


// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


const User = mongoose.model("user", userSchema);

module.exports = User;
