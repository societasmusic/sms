const express = require("express");
const router = express.Router();
const ussController = require("../controllers/ussController");
const authController = require("../controllers/authController");

router.get("/uss", authController.isLoggedIn, ussController.getIndex);

router.get("/uss/personal", authController.isLoggedIn, ussController.getPersonal);

router.get("/uss/contact", authController.isLoggedIn, ussController.getContact);

router.get("/uss/contact/address/add", authController.isLoggedIn, ussController.getAddAddress);
router.post("/uss/contact/address/add", authController.isLoggedIn, ussController.postAddAddress);
router.get("/uss/contact/address/:id/edit", authController.isLoggedIn, ussController.getEditAddress);
router.post("/uss/contact/address/:id/edit", authController.isLoggedIn, ussController.postEditAddress);
router.post("/uss/contact/address/:id/delete", authController.isLoggedIn, ussController.postDeleteAddress);

router.get("/uss/contact/emergency/add", authController.isLoggedIn, ussController.getAddEmergencyContact);
router.post("/uss/contact/emergency/add", authController.isLoggedIn, ussController.postAddEmergencyContact);
router.get("/uss/contact/emergency/:id/edit", authController.isLoggedIn, ussController.getEditEmergencyContact);
router.post("/uss/contact/emergency/:id/edit", authController.isLoggedIn, ussController.postEditEmergencyContact);
router.post("/uss/contact/emergency/:id/delete", authController.isLoggedIn, ussController.postDeleteEmergencyContact);

router.get("/uss/employment", authController.isLoggedIn, ussController.getEmployment);

module.exports = router;