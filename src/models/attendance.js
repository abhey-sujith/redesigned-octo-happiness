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

const attendanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Please enter an employee_id"],
    },
    in_time: {
      type: Date,
    },
    in_location: {
      type: Object,
    },
    out_time: {
      type: Date,
    },
    out_details: {
      type: String,
    },
    out_location: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("attendance", attendanceSchema);

module.exports = Attendance;
