const express = require("express");
const router = express.Router();
const scmController = require("../controllers/scmController");
const authController = require("../controllers/authController");

router.get("/scm", authController.isLoggedIn, scmController.getIndex);

router.get("/scm/vendors", authController.isLoggedIn, scmController.getVendors);
router.get("/scm/vendors/create", authController.isLoggedIn, scmController.getCreateVendor);
router.post("/scm/vendors/create", authController.isLoggedIn, scmController.postCreateVendor);

module.exports = router;