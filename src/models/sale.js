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
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_0900: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1000: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1100: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1200: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1300: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1400: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1500: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1600: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1700: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
    time_1800: {
      Total_Lead: Number,
      Total_Acivation: Number,
      Total_TDL: Number,
      Total_TSS: Number,
      Details: String,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model("sale", saleSchema);

module.exports = Sale;
