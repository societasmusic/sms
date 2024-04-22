const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authController = require("../controllers/authController");

router.get("/profile", authController.isLoggedIn, profileController.getIndex);

router.get("/profile/personal", authController.isLoggedIn, profileController.getPersonal);

router.get("/profile/contact", authController.isLoggedIn, profileController.getContact);

router.get("/profile/contact/emergency/add", authController.isLoggedIn, profileController.getAddEmergencyContact);
router.post("/profile/contact/emergency/add", authController.isLoggedIn, profileController.postAddEmergencyContact);

router.get("/profile/contact/emergency/:id/edit", authController.isLoggedIn, profileController.getEditEmergencyContact);
router.post("/profile/contact/emergency/:id/edit", authController.isLoggedIn, profileController.postEditEmergencyContact);

module.exports = router;