var mongoose = require("mongoose");
const { isEmail } = require("validator");
var bcrypt = require("bcrypt");
const config = require("../config");

function validator(val) {
  if (config.rolesArray.includes(val)) return true;
  else return false;
}
function validateName(val) {
  var regex = /^[a-zA-Z0-9 ]{2,30}$/;
  return regex.test(val);
}

const contractSchema = new mongoose.Schema(
  {
    contractname: {
      type: String,
      unique: true,
      required: [true, "Please enter an name"],
      // validate: [isEmail, "Please enter a valid email"],
    },
    contractdetails: {
      type: String,
      // required: [true, "Please enter an username"],
      // validate: [validateName, "Please enter a valid username"],
    },
    contractpeople: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please enter a User in Users Collection"],
        // validate: [validateName, "Please enter a valid username"],
      },
    ],
    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please enter the person who creates the contract"],
    },
    updatedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please enter the person who creates the contract"],
    },
    state: {
      type: String,
      default: config.status.ONGOING,
    },
  },
  { timestamps: true }
);

const Contract = mongoose.model("contract", contractSchema);

module.exports = Contract;
