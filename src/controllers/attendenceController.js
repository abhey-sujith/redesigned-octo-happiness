const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Attendance = require("../models/attendance");
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
  if (err.message === "only SALES_USER can access this") {
    errors.other = "only SALES_USER can access this";
    return errors;
  }
  if (
    err.message === "There is a difference in time between client and server"
  ) {
    errors.other = "There is a difference in time between client and server";
    return errors;
  }
  if (err.message === "Time over") {
    errors.other = "Time over";
    return errors;
  }
  if (err.message === "Already Added") {
    errors.other = "Already Added";
    return errors;
  }
  if (err.message === "Cannot Update") {
    errors.other = "Cannot Update";
    return errors;
  }
  // validation errors
  if (err.message.includes("quotation validation failed")) {
    Object.values(err.errors).forEach((properties) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// controller actions

module.exports.getuserattendance = async (req, res) => {
  try {
    if ([config.roles.SALES_USER].includes(req.decoded.role)) {
      var morning = new Date();
      var evening = new Date();
      // today.setHours(today.getHours() - 10);
      const data = await Attendance.findOne({
        employee_id: req.decoded.userId,
        $or: [
          { in_time: { $gte: morning.setHours(08, 0, 0, 0) } },
          { out_time: { $gte: evening.setHours(14, 0, 0, 0) } },
        ],
      });
      return res.status(200).json({
        message: "fetch successful",
        data,
      });
    } else {
      throw Error("only SALES_USER can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.addattendence = async (req, res) => {
  const currentTimestamp = req.body.currentTimestamp;
  const location = req.body.location;

  const currentBackendTimestamp = new Date();
  const currentFrontendTimestamp = new Date(currentTimestamp);
  const difference = Math.abs(
    currentFrontendTimestamp - currentBackendTimestamp
  );
  console.log(
    currentFrontendTimestamp,
    Math.abs(currentFrontendTimestamp - currentBackendTimestamp),
    currentFrontendTimestamp.getHours()
  );
  try {
    if ([config.roles.SALES_USER].includes(req.decoded.role)) {
      if (difference < 900000) {
        var today = new Date();
        var checktime0800 =
          currentFrontendTimestamp.getHours() >= 08 &&
          currentFrontendTimestamp.getHours() < 14;
        var checktime1400 =
          currentFrontendTimestamp.getHours() >= 14 &&
          currentFrontendTimestamp.getHours() <= 21;

        if (checktime0800) {
          console.log("innnn checktime0800", checktime0800);
          const attendance_present = await Attendance.find({
            employee_id: req.decoded.userId,
            in_time: { $gte: today.setHours(08, 0, 0, 0) },
          });
          if (attendance_present.length !== 0) {
            throw Error("Already Added");
          }
          const createattendance = await Attendance.create({
            employee_id: new ObjectId(req.decoded.userId),
            in_time: new Date(),
            in_location: location,
          });
          if (createattendance) {
            res.status(201).json({
              message: "attendance added",
              createattendance,
            });
          }
        } else if (checktime1400) {
          console.log("innnn checktime1400", checktime1400);
          // const attendance = await Attendance.create({
          //   employee_id: new ObjectId(req.decoded.userId),
          //   in_time: new Date(),
          //   in_location: 2345235234.15,
          // });
          const attendance = await Attendance.find({
            employee_id: req.decoded.userId,
            $or: [
              { in_time: { $gte: today.setHours(08, 0, 0, 0) } },
              { out_time: { $gte: today.setHours(14, 0, 0, 0) } },
            ],
          });
          console.log(attendance, "--------");
          if (attendance.length === 1) {
            console.log("innnnnsrfsrdf", attendance[0]._id);
            const updatedattendance = await Attendance.findByIdAndUpdate(
              attendance[0]._id,
              {
                $set: {
                  out_time: new Date(),
                  out_location: location,
                },
              },
              {
                new: true,
              }
            );

            if (updatedattendance) {
              res.status(201).json({
                message: "attendance updated",
                updatedattendance,
              });
            }
          } else if (attendance.length === 0) {
            console.log("nothing present");
            const createattendance = await Attendance.create({
              employee_id: new ObjectId(req.decoded.userId),
              in_time: today.setHours(14, 0, 0, 0),
              in_location: location,
              out_time: new Date(),
              out_location: location,
            });
            if (attendance) {
              res.status(201).json({
                message: "attendance added",
                createattendance,
              });
            }
          } else {
            throw Error("Cannot Update");
          }
        } else {
          throw Error("Time over");
        }
      } else {
        throw Error("There is a difference in time between client and server");
      }
    } else {
      throw Error("only SALES_USER can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
