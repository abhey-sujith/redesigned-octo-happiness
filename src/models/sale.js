var mongoose = require("mongoose");
const { isEmail } = require("validator");
var bcrypt = require("bcrypt");
const config = require("../config");

function validator(val) {
  if (config.rolesArray.includes(val)) return true;
  else return false;
}
function validateName(val) {
  var regex = /^[a-zA-Z ]{2,30}$/;
  return regex.test(val);
}

const saleSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Please enter an employee_id"],
    },
    time_0800: {
      type: Object,
    },
    time_0900: {
      type: Object,
    },
    time_1000: {
      type: Object,
    },
    time_1100: {
      type: Object,
    },
    time_1200: {
      type: Object,
    },
    time_1300: {
      type: Object,
    },
    time_1400: {
      type: Object,
    },
    time_1500: {
      type: Object,
    },
    time_1600: {
      type: Object,
    },
    time_1700: {
      type: Object,
    },
    time_1800: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model("sale", saleSchema);

module.exports = Sale;
