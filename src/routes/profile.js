const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authController = require("../controllers/authController");

router.get("/profile", authController.isLoggedIn, profileController.getIndex);
router.get("/profile/personal", authController.isLoggedIn, profileController.getPersonal);

module.exports = router;