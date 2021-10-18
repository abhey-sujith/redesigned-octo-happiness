const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Contract = require("../models/contract");
const config = require("../config");
// handle errors
const handleErrors = (err) => {
  //   console.log(err.message, err.code);
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
  if (err.message.includes("contract validation failed")) {
    console.log(err.errors);
    // errors.other = "only MT_ADMIN can access this";
    // return errors;
    Object.values(err.errors).forEach((properties) => {
      if (properties.kind === "[ObjectId]") {
        errors.other = "contract attached user id failed";
        return errors;
      }
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
  const contractpeople = req.body.contractpeople;
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
        createdby: req.decoded.userId,
        updatedby: req.decoded.userId,
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
    res.status(400).json({ errors });
  }
};

module.exports.editcontract = async (req, res) => {
  const contractId = req.body.contractId;
  const contractname = req.body.contractname;
  const contractdetails = req.body.contractdetails;
  const contractpeople = req.body.contractpeople;
  const state = req.body.state;
  console.log(contractname, contractdetails, contractpeople);
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const contract = await Contract.findByIdAndUpdate(
        contractId,
        {
          $set: {
            contractname,
            contractdetails,
            contractpeople,
            state,
            updatedby: req.decoded.userId,
          },
        },
        { new: true }
      );

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
    res.status(400).json({ errors });
  }
};

module.exports.getallmtcontract = async (req, res) => {
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const contracts = await Contract.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "createdby",
            foreignField: "_id",
            as: "createdby",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updatedby",
            foreignField: "_id",
            as: "updatedby",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "contractpeople",
            foreignField: "_id",
            as: "people",
          },
        },
        {
          $project: {
            contractname: 1,
            contractdetails: 1,
            state: 1,
            createdAt: 1,
            updatedAt: 1,
            createdby: {
              username: 1,
              email: 1,
              _id: 1,
            },
            updatedby: {
              username: 1,
              email: 1,
              _id: 1,
            },
            people: {
              username: 1,
              email: 1,
              _id: 1,
            },
          },
        },
      ]);
      return res.status(200).json({
        message: "fetch successful",
        contracts,
      });
    } else {
      throw Error("only MT_ADMIN can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.deletemtcontract = async (req, res) => {
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const response = await Contract.deleteOne({ _id: req.body.contractId });
      return res.status(200).json({
        message: "Contract deleted",
        response,
      });
    } else {
      throw Error("only MT_ADMIN can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
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
