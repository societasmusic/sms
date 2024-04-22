const express = require("express");
const router = express.Router();
const scmController = require("../controllers/scmController");
const authController = require("../controllers/authController");

router.get("/scm", authController.isLoggedIn, scmController.getIndex);

router.get("/scm/vendors", authController.isLoggedIn, scmController.getVendors);

module.exports = router;