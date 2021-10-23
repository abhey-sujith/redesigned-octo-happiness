var mongoose = require("mongoose");
const { isEmail } = require("validator");
var bcrypt = require("bcrypt");
const config = require("../config");

function validator(val) {
  if (config.rolesArray.includes(val)) return true;
  else return false;
}

const quotationSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Please enter an name"],
    },
    quotationDetails: {
      type: String,
      required: [true, "Please enter an quotationDetails"],
    },
    requirements: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: [true, "Please enter an amount"],
    },
    daysToComplete: {
      type: Number,
      required: [true, "Please enter the days to complete"],
    },
    advanceAmount: {
      type: Number,
      default: null,
    },
    settledAmount: {
      type: Number,
      default: null,
    },
    people: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        // validate: [validateName, "Please enter a valid username"],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Please enter the person who creates the contract"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Please enter the person who creates the contract"],
    },
    state: {
      type: String,
      default: config.status.PENDING,
    },
    deliveryDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Quotation = mongoose.model("quotation", quotationSchema);

module.exports = Quotation;
