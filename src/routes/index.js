const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");
const authController = require("../controllers/authController");

router.get("/", authController.isLoggedIn, indexController.getIndex);
router.get("/dashboard", authController.isLoggedIn, indexController.getDash);

module.exports = router;