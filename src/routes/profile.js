const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authController = require("../controllers/authController");

router.get("/profile", authController.isLoggedIn, profileController.getIndex);

router.get("/profile/personal", authController.isLoggedIn, profileController.getPersonal);

router.get("/profile/contact", authController.isLoggedIn, profileController.getContact);

router.get("/profile/contact/address/add", authController.isLoggedIn, profileController.getAddAddress);
router.post("/profile/contact/address/add", authController.isLoggedIn, profileController.postAddAddress);
router.get("/profile/contact/address/:id/edit", authController.isLoggedIn, profileController.getEditAddress);
router.post("/profile/contact/address/:id/edit", authController.isLoggedIn, profileController.postEditAddress);
router.post("/profile/contact/address/:id/delete", authController.isLoggedIn, profileController.postDeleteAddress);

router.get("/profile/contact/emergency/add", authController.isLoggedIn, profileController.getAddEmergencyContact);
router.post("/profile/contact/emergency/add", authController.isLoggedIn, profileController.postAddEmergencyContact);
router.get("/profile/contact/emergency/:id/edit", authController.isLoggedIn, profileController.getEditEmergencyContact);
router.post("/profile/contact/emergency/:id/edit", authController.isLoggedIn, profileController.postEditEmergencyContact);
router.post("/profile/contact/emergency/:id/delete", authController.isLoggedIn, profileController.postDeleteEmergencyContact);

module.exports = router;