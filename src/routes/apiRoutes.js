const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt");
const authController = require("../controllers/authController");
const mtController = require("../controllers/movetechController");

router.get("/", (req, res) => {
  res.status(201).json({
    message: "Welcome to the API.",
  });
});

// Auth Routes
router.post("/login", authController.login_post);
router.post("/register", authController.signup_post);

router.get("/user", auth.checkToken, authController.get_user);
router.post("/reset-password", auth.checkToken, authController.reset_password);

router.post(
  "/superuser-reset-password",
  auth.checkToken,
  authController.super_user_reset_password
);
router.post(
  "/superuser-createuser",
  auth.checkToken,
  authController.super_user_create_user
);
router.post(
  "/superuser-edituser",
  auth.checkToken,
  authController.super_user_edit_user
);
router.get(
  "/superuser-getallusers",
  auth.checkToken,
  authController.super_user_getallusers
);
// router.get("/superuser-getusers", auth.checkToken ,  authController.super_user_getall_users);
router.delete(
  "/superuser-deleteuser",
  auth.checkToken,
  authController.super_user_delete_user
);

router.get("/getallmtusers", auth.checkToken, mtController.getallmtusers);
router.post("/create-quotation", auth.checkToken, mtController.createQuotation);
router.post(
  "/approve-quotation",
  auth.checkToken,
  mtController.approvequotation
);
router.post("/end-quotation", auth.checkToken, mtController.endquotation);
router.post("/edit-quotation", auth.checkToken, mtController.editquotation);
router.get(
  "/getallmtquotations",
  auth.checkToken,
  mtController.getallmtquotations
);
router.delete(
  "/deletemtquotation",
  auth.checkToken,
  mtController.deletemtquotation
);
// router.get(
//   "/getmt-availablecontract",
//   auth.checkToken,
//   mtController.getmtavailablecontract
// );

module.exports = router;
