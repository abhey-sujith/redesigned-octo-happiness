const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Contract = require("../models/contract");
const config = require("../config");
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {
    contractname: "",
    contractdetails: "",
    contractpeople: "",
    other: "",
  };
  if (err.code === 11000) {
    errors.contractname = "A contract with this name is already created";
    return errors;
  }
  if (err.message === "only MT_ADMIN can access this") {
    errors.other = "only MT_ADMIN can access this";
    return errors;
  }
  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// controller actions
module.exports.getallmtusers = async (req, res) => {
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const users = await User.find(
        { role: config.roles.MT_USER },
        "email username"
      );
      return res.status(200).json({
        message: "fetch successful",
        users,
      });
    } else {
      throw Error("only MT_ADMIN can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.createcontract = async (req, res) => {
  const contractname = req.body.contractname;
  const contractdetails = req.body.contractdetails;
  const contractpeople = JSON.parse(req.body.contractpeople);
  console.log(contractname, contractdetails, contractpeople);
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const contract = await Contract.create({
        contractname,
        contractdetails,
        contractpeople,
      });
      if (contract) {
        res.status(201).json({
          message: "Contract created",
          contract,
        });
      }
    } else {
      throw Error("only MT_ADMIN can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    console.log(errors);
    res.status(400).json({ errors });
  }
};

// module.exports.createcontract = async (req, res) => {

//     try {
//         if([config.roles.SUPER_ADMIN,config.roles.MT_ADMIN].includes(req.decoded.role)){

//         } else {
//           throw Error("only MT_ADMIN can access this");
//         }
//       } catch (err) {
//         const errors = handleErrors(err);
//         res.status(400).json({ errors });
//       }
// }
