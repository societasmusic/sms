const express = require("express");
const router = express.Router();
const tpsController = require("../controllers/tpsController");
const authController = require("../controllers/authController");

router.get("/tps", authController.isLoggedIn, tpsController.getIndex);

router.get("/tps/expenses", authController.isLoggedIn, tpsController.getExpensesIndex);
router.get("/tps/expenses/create", authController.isLoggedIn, tpsController.getExpensesCreate);
router.post("/tps/expenses/create", authController.isLoggedIn, tpsController.postExpensesCreate);
router.get("/tps/expenses/advances/request", authController.isLoggedIn, tpsController.getAdvanceRequest);
router.post("/tps/expenses/advances/request", authController.isLoggedIn, tpsController.postAdvanceRequest);
router.get("/tps/expenses/advances/:id", authController.isLoggedIn, tpsController.getAdvanceView);


module.exports = router;