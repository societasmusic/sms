const express = require("express");
const router = express.Router();
const utilitiesController = require("../controllers/utilitiesController");
const authController = require("../controllers/authController");

router.get("/utilities/bookmark", authController.isLoggedIn, utilitiesController.getBookmark);

module.exports = router;