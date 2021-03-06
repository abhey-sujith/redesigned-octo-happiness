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
  if (err.message === "People have already been assigned to this quotation") {
    errors.other = "People have already been assigned to this quotation";
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
      const quotation = await Quotation.findByIdAndUpdate(quotationId, {
        $set: {
          advanceAmount,
          deliveryDate,
          startDate,
          people,
          updatedby: req.decoded.userId,
          state: config.status.APPROVED,
        },
      });

      if (quotation) {
        const exists = await User.exists({
          "quotationDetails.quotation": ObjectId(quotationId),
        });
        if (exists) {
          throw new Error(
            "People have already been assigned to this quotation"
          );
        }
        console.log(exists);
        await User.updateMany(
          { _id: { $in: people } },
          {
            $push: {
              quotationDetails: {
                state: config.status.ONGOING,
                startedOn: null,
                endedOn: null,
                quotation: new ObjectId(quotationId),
              },
            },
          }
        );
        res.status(201).json({
          message: "quotation approved",
          quotation,
        });
      }
    } else {
      throw Error("only MT_ADMIN can access this");
    }
  } catch (err) {
    console.log(err);
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
      const quotation = await Quotation.findByIdAndUpdate(quotationId, {
        $set: {
          settledAmount,
          endDate,
          updatedby: req.decoded.userId,
          state: config.status.DONE,
        },
      });

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
      const contract = await Quotation.findByIdAndUpdate(quotationId, {
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
      });

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
        .populate({ path: "updatedBy", select: "username email" })
        .populate({ path: "people", select: "username email" });
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

module.exports.getallquotations = async (req, res) => {
  try {
    if (
      [config.roles.SUPER_ADMIN, config.roles.MT_ADMIN].includes(
        req.decoded.role
      )
    ) {
      // const quotations = await Quotation.find({}, {})
      //   .populate({ path: "createdBy", select: "username email" })
      //   .populate({ path: "updatedBy", select: "username email" })
      //   .populate({ path: "people", select: "username email" });
      var sort = {};
      console.log(req.query);
      const pagination = req.query.pagination
        ? parseInt(req.query.pagination)
        : 10;
      //PageNumber From which Page to Start
      const pageNumber = req.query.page ? parseInt(req.query.page) + 1 : 1;

      const stateQuery =
        req.body.state && req.body.state?.length > 0
          ? req.body.state
          : [config.status.PENDING, config.status.DONE, config.status.APPROVED];

      const sortModel =
        req.body.sortModel && req.body.sortModel?.length > 0
          ? req.body.sortModel
          : [{ field: "updatedAt", sort: "desc" }];

      sort[sortModel[0].field] = sortModel[0].sort === "asc" ? 1 : -1;
      console.log(stateQuery, sortModel, sort, "sort-----------");
      const total = await Quotation.count({ state: { $in: stateQuery } });
      Quotation.find({ state: { $in: stateQuery } })
        //skip takes argument to skip number of entries
        .sort(sort)
        .skip((pageNumber - 1) * pagination)
        // //limit is number of Records we want to display
        .limit(pagination)
        .populate({ path: "createdBy", select: "username" })
        .populate({ path: "updatedBy", select: "username" })
        .populate({ path: "people", select: "username email -_id" })
        .then((data) => {
          if (data) {
            const quotations = data.map((obj) => {
              return {
                id: obj._id,
                customerName: obj.customerName,
                quotationDetails: obj.quotationDetails,
                requirements: obj.requirements ? obj.requirements : null,
                amount: obj.amount,
                daysToComplete: obj.daysToComplete,
                advanceAmount: obj.advanceAmount ? obj.advanceAmount : null,
                settledAmount: obj.settledAmount ? obj.settledAmount : null,
                people: obj.people?.length > 0 ? obj.people : [],
                createdBy: obj.createdBy.username,
                updatedBy: obj.updatedBy.username,
                state: obj.state,
                createdAt: obj.createdAt,
                updatedAt: obj.updatedAt,
                startDate: obj.startDate ? obj.startDate : null,
              };
            });

            res.status(200).send({
              quotations,
              total,
            });
          } else {
            res.status(200).send({
              quotations: [],
              total: 0,
            });
          }
        })
        .catch((err) => {
          res.status(400).send({
            err: err,
          });
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

module.exports.getmtquotations = async (req, res) => {
  try {
    if ([config.roles.MT_USER].includes(req.decoded.role)) {
      const data = await User.findOne(
        { _id: req.decoded.userId },
        "quotationDetails"
      ).populate({
        path: "quotationDetails.quotation",
      });
      await data.populate({
        path: "quotationDetails.quotation.people",
        select: "username email",
      });
      return res.status(200).json({
        message: "fetch successful",
        data,
      });
    } else {
      throw Error("only MT_USER can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.setquotation = async (req, res) => {
  try {
    const state = req.body.state;
    const settledAmount = req.body.settledAmount;
    const quotationId = req.body.quotationId;
    console.log(state, settledAmount, quotationId);
    if ([config.roles.MT_USER].includes(req.decoded.role)) {
      const data = await User.updateOne(
        {
          _id: req.decoded.userId,
          "quotationDetails._id": req.body.arrayElementId,
        },
        state === config.status.ACCEPTED
          ? {
              $set: {
                "quotationDetails.$.state": state,
                "quotationDetails.$.startedOn": new Date(),
              },
            }
          : {
              $set: {
                "quotationDetails.$.state": state,
                "quotationDetails.$.endedOn": new Date(),
              },
            }
      );

      const [{ totalCount }] = await User.aggregate([
        {
          $match: {
            "quotationDetails.quotation": new ObjectId(quotationId),
          },
        },
        {
          $facet: {
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      const [{ doneCount }] = await User.aggregate([
        {
          $match: {
            $and: [
              {
                "quotationDetails.quotation": new ObjectId(quotationId),
              },
              {
                "quotationDetails.state": "DONE",
              },
            ],
          },
        },
        {
          $facet: {
            doneCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      if (
        settledAmount &&
        quotationId &&
        totalCount[0].count === doneCount[0].count
      ) {
        console.log("innnnnnnnn--------");
        await Quotation.findByIdAndUpdate(quotationId, {
          $set: {
            settledAmount,
            state: config.status.DONE,
          },
        });
      } else if (totalCount[0]?.count === doneCount[0]?.count) {
        console.log("innnnnnnnn--------");
        await Quotation.findByIdAndUpdate(quotationId, {
          $set: {
            state: config.status.DONE,
          },
        });
      } else if (settledAmount && quotationId) {
        await Quotation.findByIdAndUpdate(quotationId, {
          $set: {
            settledAmount,
          },
        });
      }
      console.log(data, totalCount, doneCount);
      return res.status(200).json({
        message: "fetch successful",
        data,
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
