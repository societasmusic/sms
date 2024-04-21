const express = require("express");
const router = express.Router();
const mwdController = require("../controllers/mwdController");
const authController = require("../controllers/authController");

router.get("/mwd", authController.isLoggedIn, mwdController.getIndex);

router.get("/mwd/expenses", authController.isLoggedIn, mwdController.getExpensesIndex);
router.get("/mwd/expenses/create", authController.isLoggedIn, mwdController.getExpensesCreate);
router.post("/mwd/expenses/create", authController.isLoggedIn, mwdController.postExpensesCreate);
router.get("/mwd/expenses/advances/request", authController.isLoggedIn, mwdController.getAdvanceRequest);
router.post("/mwd/expenses/advances/request", authController.isLoggedIn, mwdController.postAdvanceRequest);
router.get("/mwd/expenses/advances/:id", authController.isLoggedIn, mwdController.getAdvanceView);


module.exports = router;