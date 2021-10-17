const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const User = require("../models/user");
const config = require("../config");
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "", role: "", other: "" };

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  if (err.message === "incorrect password") {
    errors.other = "Authentication Failed";
    return errors;
  }
  if (err.message === "incorrect email") {
    errors.email = "The Email is not found";
    return errors;
  }
  if (err.message === "user does not exist") {
    errors.other = "The User does not exist";
    return errors;
  }
  if (err.message === "only SUPER_ADMIN can reset password") {
    errors.other = "Only SUPER_ADMIN can reset password";
    return errors;
  }
  if (err.message === "only SUPER_ADMIN can create users") {
    errors.other = "Only SUPER_ADMIN can create users";
    return errors;
  }
  if (err.message === "only SUPER_ADMIN can delete user") {
    errors.other = "Only SUPER_ADMIN can delete user";
    return errors;
  }
  if (err.message === "Could not create user") {
    errors.other = "Could not create user";
    return errors;
  }
  if (err.message === "Could not edit user") {
    errors.other = "Could not edit user";
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
module.exports.signup_post = async (req, res) => {
  try {
    var email = req.body.email;
    var username = req.body.username;
    var role = req.body.role;
    var password = "password";
    console.log(password, "--------password");

    const user = await User.create({
      email,
      role,
      username,
      password,
    });

    if (!user) {
      throw Error("Could not create user");
    }
    if (user) {
      console.log("Signed up");
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
          role: user.role,
        },
        process.env.SECRET,
        {
          expiresIn: "12h",
        }
      );
      return res.status(200).json({
        message: "Auth successful",
        token: token,
        uid: user._id,
        email: user.email,
        username: user.username,
        // role: user.role,
        // resetpassword: user.resetpassword
      });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const auth = await bcrypt.compare(password, user.password);

      if (auth) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            role: user.role,
          },
          process.env.SECRET,
          {
            expiresIn: "12h",
          }
        );
        return res.status(200).json({
          message: "Auth successful",
          token: token,
          uid: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          resetpassword: user.resetpassword,
        });
      }
      throw Error("incorrect password");
    }
    throw Error("incorrect email");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.get_user = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.decoded.userId });

    if (user) {
      console.log("logged in");
      return res.status(200).json({
        message: "user found",
        uid: user._id,
        email: user.email,
      });
    } else {
      throw Error("user does not exist");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.reset_password = async (req, res) => {
  try {
    var password = req.body.password;
    const user = await User.findOne({ _id: req.decoded.userId });

    if (user) {
      console.log("user found");
      user.password = password;
      user.resetpassword = false;
      await user.save();

      return res.status(200).json({
        message: "password is set",
        uid: user._id,
        resetpassword: user.resetpassword,
      });
    } else {
      throw Error("user does not exist");
    }
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.super_user_reset_password = async (req, res) => {
  try {
    if (req.decoded.role === config.roles.SUPER_ADMIN) {
      const user = await User.findOne({ _id: req.body.userId });

      if (user) {
        console.log("user found");
        user.password = "password";
        user.resetpassword = true;
        await user.save();

        return res.status(200).json({
          message: "password is reset",
          uid: user._id,
          role: user.role,
          resetpassword: user.resetpassword,
        });
      } else {
        throw Error("user does not exist");
      }
    } else {
      throw Error("only SUPER_ADMIN can reset password");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.super_user_create_user = async (req, res) => {
  try {
    if (req.decoded.role === config.roles.SUPER_ADMIN) {
      var email = req.body.email;
      var username = req.body.username;
      var password = "password";
      var role = req.body.role;
      console.log(req.body);

      const user = await User.create({
        email,
        role,
        username,
        password,
      });

      if (!user) {
        throw Error("Could not create user");
      }
      if (user) {
        console.log("Signed up");
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            role: user.role,
          },
          process.env.SECRET,
          {
            expiresIn: "12h",
          }
        );
        return res.status(200).json({
          message: "Auth successful",
          token: token,
          uid: user._id,
          email: user.email,
          username: user.username,
          // role: user.role,
          // resetpassword: user.resetpassword
        });
      }
    } else {
      throw Error("only SUPER_ADMIN can create users");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.super_user_edit_user = async (req, res) => {
  try {
    if (req.decoded.role === config.roles.SUPER_ADMIN) {
      var email = req.body.email;
      var username = req.body.username;
      var role = req.body.role;
      console.log(req.body);

      const user = await User.findOneAndUpdate(
        email,
        { $set: { username, role } },
        { new: true }
      );

      console.log(user.username);
      if (!user) {
        throw Error("Could not edit user");
      }

      if (user) {
        console.log("edited user");
        return res.status(200).json({
          message: "Edited user",
          uid: user._id,
          email: user.email,
          username: user.username,
          // role: user.role,
          // resetpassword: user.resetpassword
        });
      }
    } else {
      throw Error("only SUPER_ADMIN can create users");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.super_user_getallusers = async (req, res) => {
  try {
    if (req.decoded.role === config.roles.SUPER_ADMIN) {
      const users = await User.find({}, "email username role isactive");
      return res.status(200).json({
        message: "fetch successful",
        users,
      });
    } else {
      throw Error("only SUPER_ADMIN can access this");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// module.exports.super_user_getall_users = async (req, res) => {
//   try {
//     var pageno = req.query.pageno > 1 ? req.query.pageno : 1;
//     if (req.decoded.role === config.roles.SUPER_ADMIN) {
//       const users = await User.find()
//         .skip(10 * (pageno - 1))
//         .limit(10);
//       const totalcount = await User.count();
//       return res.status(200).json({
//         message: "fetch successful",
//         users,
//         totalcount,
//       });
//     } else {
//       throw Error("only SUPER_ADMIN can access this");
//     }
//   } catch (err) {
//     const errors = handleErrors(err);
//     res.status(400).json({ errors });
//   }
// };

module.exports.super_user_delete_user = async (req, res) => {
  try {
    console.log(req.body.userId);

    if (req.decoded.role === config.roles.SUPER_ADMIN) {
      const response = await User.deleteOne({ _id: req.body.userId });
      return res.status(200).json({
        message: "user deleted",
        response,
      });
    } else {
      throw Error("only SUPER_ADMIN can delete user");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
