const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authController = require("../controllers/authController");

router.get("/tasks", authController.isLoggedIn, taskController.getIndex);

module.exports = router;