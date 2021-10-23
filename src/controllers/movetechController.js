const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Quotation = require("../models/quotation");
const config = require("../config");
var mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {
    customerName: "",
    quotationDetails: "",
    amount: "",
    daysToComplete: "",
    other: "",
  };
  //   if (err.code === 11000) {
  //     errors.contractname = "A contract with this name is already created";
  //     return errors;
  //   }
  if (err.message === "only MT_ADMIN can access this") {
    errors.other = "only MT_ADMIN can access this";
    return errors;
  }
  if (err.message === "only MT_USER can access this") {
    errors.other = "only MT_USER can access this";
    return errors;
  }
  // validation errors
  if (err.message.includes("quotation validation failed")) {
    // console.log(err.errors);
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

module.exports.createQuotation = async (req, res) => {
  const customerName = req.body.customerName;
  const quotationDetails = req.body.quotationDetails;
  const requirements = req.body.requirements;
  const amount = req.body.amount;
  const daysToComplete = req.body.daysToComplete;
  console.log(
    customerName,
    quotationDetails,
    requirements,
    amount,
    daysToComplete,
    req.decoded.userId
  );
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const quotation = await Quotation.create({
        customerName,
        quotationDetails,
        requirements,
        amount,
        daysToComplete,
        createdBy: req.decoded.userId,
        updatedBy: req.decoded.userId,
      });
      if (quotation) {
        res.status(201).json({
          message: "Contract created",
          quotation,
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

module.exports.approvequotation = async (req, res) => {
  const advanceAmount = req.body.advanceAmount;
  const deliveryDate = req.body.deliveryDate;
  const startDate = req.body.startDate;
  const people = req.body.people;
  const quotationId = req.body.quotationId;
  console.log(advanceAmount, deliveryDate, startDate, people, quotationId);
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const quotation = await Quotation.findByIdAndUpdate(
        quotationId,
        {
          $set: {
            advanceAmount,
            deliveryDate,
            startDate,
            people,
            updatedby: req.decoded.userId,
            state: config.status.APPROVED,
          },
        },
        { upsert: true }
      );

      if (quotation) {
        res.status(201).json({
          message: "quotation approved",
          quotation,
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

module.exports.endquotation = async (req, res) => {
  const settledAmount = req.body.settledAmount;
  const endDate = req.body.endDate;
  const quotationId = req.body.quotationId;
  console.log(settledAmount, endDate, quotationId);
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const quotation = await Quotation.findByIdAndUpdate(
        quotationId,
        {
          $set: {
            settledAmount,
            endDate,
            updatedby: req.decoded.userId,
            state: config.status.DONE,
          },
        },
        { upsert: true }
      );

      if (quotation) {
        res.status(201).json({
          message: "quotation done",
          quotation,
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

module.exports.editquotation = async (req, res) => {
  const quotationId = req.body.quotationId;
  const quotationDetails = req.body.quotationDetails;
  const customerName = req.body.customerName;
  const requirements = req.body.requirements;
  const amount = req.body.amount;
  const daysToComplete = req.body.daysToComplete;
  const advanceAmount = req.body.advanceAmount;
  const deliveryDate = req.body.deliveryDate;
  const settledAmount = req.body.settledAmount;
  console.log(
    customerName,
    quotationDetails,
    requirements,
    amount,
    daysToComplete,
    advanceAmount,
    deliveryDate,
    settledAmount,
    quotationId
  );
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const contract = await Quotation.findByIdAndUpdate(
        quotationId,
        {
          $set: {
            customerName,
            quotationDetails,
            requirements,
            amount,
            daysToComplete,
            advanceAmount,
            deliveryDate,
            settledAmount,
            updatedby: req.decoded.userId,
          },
        },
        { upsert: true }
      );

      if (quotationId) {
        res.status(201).json({
          message: "Quotation edited created",
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

module.exports.getallmtquotations = async (req, res) => {
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const quotations = await Quotation.find({}, {})
        .populate({ path: "createdBy", select: "username email" })
        .populate({ path: "updatedBy", select: "username email" });
      return res.status(200).json({
        message: "fetch successful",
        quotations,
      });
    } else {
      throw Error("only MT_ADMIN can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.deletemtquotation = async (req, res) => {
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      const response = await Quotation.deleteOne({ _id: req.body.quotationId });
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

// module.exports.getmtavailablecontract = async (req, res) => {
//   try {
//     if ([config.roles.MT_USER].includes(req.decoded.role)) {
//       const data = await User.aggregate([
//         {
//           $match: {
//             _id: new ObjectId(req.decoded.userId),
//           },
//         },
//         {
//           $lookup: {
//             from: "contracts",
//             localField: "_id",
//             foreignField: "contractpeople",
//             as: "availablecontracts",
//           },
//         },
//         {
//           $project: {
//             availablecontracts: {
//               _id: 1,
//               contractname: 1,
//               contractdetails: 1,
//               state: 1,
//             },
//             _id: 0,
//           },
//         },
//       ]);
//       const people = await User.aggregate([
//         {
//           $match: {
//             _id: new ObjectId(req.decoded.userId),
//           },
//         },
//         {
//           $lookup: {
//             from: "contracts",
//             localField: "_id",
//             foreignField: "contractpeople",
//             as: "availablecontracts",
//           },
//         },
//         {
//           $project: {
//             availablecontracts: {
//               _id: 1,
//               contractname: 1,
//               contractdetails: 1,
//               contractpeople: 1,
//               state: 1,
//             },
//             _id: 0,
//           },
//         },
//         {
//           $unwind: {
//             path: "$availablecontracts",
//           },
//         },
//         {
//           $replaceWith: {
//             data: "$availablecontracts.contractpeople",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "data",
//             foreignField: "_id",
//             as: "data",
//           },
//         },
//         {
//           $project: {
//             data: {
//               username: 1,
//               email: 1,
//             },
//           },
//         },
//       ]);
//       return res.status(200).json({
//         message: "fetch successful",
//         data,
//         people,
//       });
//     } else {
//       throw Error("only MT_USER can access this");
//     }
//   } catch (err) {
//     const errors = handleErrors(err);
//     res.status(400).json({ errors });
//   }
// };

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
