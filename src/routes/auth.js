const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth/login", authController.getLogin);
router.post("/auth/login", authController.postLogin);

router.get("/auth/reset", authController.getReset);
router.post("/auth/reset", authController.postReset);

router.get("/auth/reset/new/:_id/:resetToken", authController.getResetNew);
router.post("/auth/reset/new/:_id/:resetToken", authController.postResetNew);

router.get("/auth/logout", authController.logout);

module.exports = router;