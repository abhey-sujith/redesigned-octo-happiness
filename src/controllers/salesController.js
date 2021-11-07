const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Sales = require("../models/sale");
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
  if (err.message === "Choose time in the range of 2 hr") {
    errors.other = "Choose time in the range of 2 hr (08:00-18:00)";
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

module.exports.getusersale = async (req, res) => {
  try {
    if ([config.roles.SALES_USER].includes(req.decoded.role)) {
      var today = new Date();
      console.log(today.setHours(07, 0, 0, 0));
      // today.setHours(today.getHours() - 10);
      const data = await Sales.findOne(
        {
          employee_id: req.decoded.userId,
          $or: [{ createdAt: { $gte: today.setHours(07, 0, 0, 0) } }],
        },
        "time_0800 time_0900 time_1000 time_1100 time_1200 time_1300 time_1400 time_1500 time_1600 time_1700 time_1800 -_id"
      );
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

module.exports.addsales = async (req, res) => {
  const startTime = req.body.startTime;

  const Total_Lead = req.body.Total_Lead;
  const Total_Acivation = req.body.Total_Acivation;
  const Total_TDL = req.body.Total_TDL;
  const Total_TSS = req.body.Total_TSS;
  const Details = req.body.Details;

  const currentBackendTimestamp = new Date();
  const currentFrontendTimestamp = new Date(startTime);
  const obj = {};
  console.log(
    currentBackendTimestamp,
    currentFrontendTimestamp,
    currentFrontendTimestamp.getHours(),
    currentBackendTimestamp.getHours()
  );

  const getHour = () => {
    if (currentFrontendTimestamp.getHours() === 8) return "08";
    else if (currentFrontendTimestamp.getHours() === 9) return "09";
    else return currentFrontendTimestamp.getHours();
  };

  // console.log(obj, "obj");
  try {
    if ([config.roles.SALES_USER].includes(req.decoded.role)) {
      if (
        currentFrontendTimestamp.getHours() >= 08 &&
        currentFrontendTimestamp.getHours() <= 18 &&
        currentFrontendTimestamp.getHours() <=
          currentBackendTimestamp.getHours() &&
        (currentFrontendTimestamp.getHours() -
          currentBackendTimestamp.getHours() ===
          -1 ||
          currentFrontendTimestamp.getHours() -
            currentBackendTimestamp.getHours() ===
            0)
      ) {
        console.log("innnn");
        const today = new Date();

        const salesdata = await Sales.find({
          employee_id: req.decoded.userId,
          createdAt: { $gte: today.setHours(07, 0, 0, 0) },
        });

        console.log(salesdata, "--------");
        if (salesdata.length === 1) {
          console.log("innnnnsrfsrdf", salesdata[0]._id);

          obj["time_" + getHour() + "00"] = {
            Total_Lead,
            Total_Acivation,
            Total_TDL,
            Total_TSS,
            Details,
          };

          const updatesale = await Sales.findByIdAndUpdate(
            salesdata[0]._id,
            {
              $set: obj,
            },
            {
              new: true,
            }
          );
          if (updatesale) {
            res.status(201).json({
              message: "attendance updated",
              updatesale,
            });
          }
        } else if (salesdata.length === 0) {
          console.log("nothing present");
          obj["time_" + getHour() + "00"] = {
            Total_Lead,
            Total_Acivation,
            Total_TDL,
            Total_TSS,
            Details,
          };
          obj["employee_id"] = new ObjectId(req.decoded.userId);
          console.log(obj, "obj-------------");
          const createsale = await Sales.create(obj);
          if (createsale) {
            res.status(201).json({
              message: "sale added",
              createsale,
            });
          }
        }
      } else {
        throw Error("Choose time in the range of 2 hr");
      }
      // if (difference) {
      //   var today = new Date();
      //   var checktime0800 =
      //     currentFrontendTimestamp.getHours() >= 08 &&
      //     currentFrontendTimestamp.getHours() < 14;
      //   var checktime1400 =
      //     currentFrontendTimestamp.getHours() >= 14 &&
      //     currentFrontendTimestamp.getHours() <= 21;
      //   if (checktime0800) {
      //     console.log("innnn checktime0800", checktime0800);
      //     const attendance_present = await Attendance.find({
      //       employee_id: req.decoded.userId,
      //       in_time: { $gte: today.setHours(08, 0, 0, 0) },
      //     });
      //     if (attendance_present.length !== 0) {
      //       throw Error("Already Added");
      //     }
      //     const createattendance = await Attendance.create({
      //       employee_id: new ObjectId(req.decoded.userId),
      //       in_time: new Date(),
      //       in_location: location,
      //     });
      //     if (createattendance) {
      //       res.status(201).json({
      //         message: "attendance added",
      //         createattendance,
      //       });
      //     }
      //   } else if (checktime1400) {
      //     console.log("innnn checktime1400", checktime1400);
      //     // const attendance = await Attendance.create({
      //     //   employee_id: new ObjectId(req.decoded.userId),
      //     //   in_time: new Date(),
      //     //   in_location: 2345235234.15,
      //     // });
      //     const attendance = await Attendance.find({
      //       employee_id: req.decoded.userId,
      //       $or: [
      //         { in_time: { $gte: today.setHours(08, 0, 0, 0) } },
      //         { out_time: { $gte: today.setHours(14, 0, 0, 0) } },
      //       ],
      //     });
      //     console.log(attendance, "--------");
      //     if (attendance.length === 1) {
      //       console.log("innnnnsrfsrdf", attendance[0]._id);
      //       const updatedattendance = await Attendance.findByIdAndUpdate(
      //         attendance[0]._id,
      //         {
      //           $set: {
      //             out_time: new Date(),
      //             out_location: location,
      //           },
      //         },
      //         {
      //           new: true,
      //         }
      //       );
      //       if (updatedattendance) {
      //         res.status(201).json({
      //           message: "attendance updated",
      //           updatedattendance,
      //         });
      //       }
      //     } else if (attendance.length === 0) {
      //       console.log("nothing present");
      //       const createattendance = await Attendance.create({
      //         employee_id: new ObjectId(req.decoded.userId),
      //         in_time: today.setHours(14, 0, 0, 0),
      //         in_location: location,
      //         out_time: new Date(),
      //         out_location: location,
      //       });
      //       if (attendance) {
      //         res.status(201).json({
      //           message: "attendance added",
      //           createattendance,
      //         });
      //       }
      //     } else {
      //       throw Error("Cannot Update");
      //     }
      //   } else {
      //     throw Error("Time over");
      //   }
      // } else {
      //   throw Error("There is a difference in time between client and server");
      // }
    } else {
      throw Error("only SALES_USER can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
