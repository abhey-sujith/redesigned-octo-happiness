const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const User = require("../models/user")

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' ,role:'',other:''};
  
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered';
      return errors;
    }

    if (err.message === "incorrect password") {
        errors.email = 'Authentication Failed';
        return errors;
      }
    if (err.message === "incorrect email") {
        errors.email = 'The Email is not found';
        return errors;
      }
    if (err.message === "user does not exist") {
        errors.other = 'The User does not exist';
        return errors;
      }
    if (err.message === "only super_user can reset password") {
        errors.other = 'Only super_user can reset password';
        return errors;
      }
    if (err.message === "only super_user can create users") {
        errors.other = 'Only super_user can create users';
        return errors;
      }
      if (err.message === "only super_user can delete user") {
        errors.other = 'Only super_user can delete user';
        return errors;
      }
    // validation errors
    if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(val);
        // console.log(properties);
        errors[properties.path] = properties.message;
      });
    }
  
    return errors;
  }
  
  // controller actions
  module.exports.signup_post = async (req, res) => {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var role = req.body.role;
        console.log(req.body);
        
        const user = await User.create({ email, password ,role});

        if (!user) {
            res.status(401).json({
              message: "Auth failed"
            });
          }
          if(user) {
            console.log("Signed up")
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id,
                role: user.role
              },
              process.env.SECRET,
              {
                expiresIn: "12h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token,
              uid: user._id
            });
        }
    }   
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
}
  
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
                    role: user.role
                },
                process.env.SECRET,
                {
                    expiresIn: "12h"
                }
                );
                return res.status(200).json({
                    message: "Auth successful",
                    token: token,
                    uid: user._id
                  });
            }
            throw Error('incorrect password');
        }
        throw Error('incorrect email');
      } 
      catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
  }
  
module.exports.get_user = async (req, res) => {
    
    try {

        const user = await User.findOne({ _id: req.decoded.userId });

        if (user) {
            console.log("logged in")
            return res.status(200).json({
                message: "user found",
                uid: user._id,
                email: user.email,
              });
          }
        else{
            throw Error('user does not exist');
        }

      } 
      catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
  }

  module.exports.super_user_reset_password = async (req, res) => {
    try {

        if(req.decoded.role==="super_user"){

        const user = await User.findOne({ _id: req.body.userId });

        if (user) {
            console.log("user found")
            user.password= await bcrypt.hash('password', salt);
            await user.save()

            return res.status(200).json({
                message: "password is reset",
                uid: user._id,
                role: user.role,
              });
          }
        else{
            throw Error('user does not exist');
        }
            
        }else{
            throw Error('only super_user can reset password');
        }
      } 
      catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
}




module.exports.super_user_create_users = async (req, res) => {
    try {
        if(req.decoded.role==="super_user"){
        var email = req.body.email;
        var password = 'password';
        var role = req.body.role;
        console.log(req.body);
        
        const user = await User.create({ email, password ,role});

        if (!user) {
            res.status(401).json({
              message: "Auth failed"
            });
          }
          if(user) {
            console.log("Signed up")
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id,
                role: user.role
              },
              process.env.SECRET,
              {
                expiresIn: "12h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token,
              uid: user._id
            });
        }
    }else{
        throw Error('only super_user can create users');
    }
    }   
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
}

module.exports.super_user_getall_users = async (req, res) => {
    try {

        var pageno = req.query.pageno>1?req.query.pageno:1;
        if(req.decoded.role==="super_user"){
            const users = await User.find().skip(10*(pageno-1)).limit(10);
            const totalcount = await User.count();
            return res.status(200).json({
                message: "fetch successful",
                users,
                totalcount
              });
        
        }else{
            throw Error('only super_user can access this');
        }

      } 
      catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
}

module.exports.super_user_delete_user = async (req, res) => {
    try {
        if(req.decoded.role==="super_user"){
            const response = await User.deleteOne({ _id: req.body.userId });
            return res.status(200).json({
                message:'user deleted',
                response
              });
        }else{
            throw Error('only super_user can delete user');
        }

      } 
      catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
}