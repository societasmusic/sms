const express = require("express");
const router = express.Router();
const aisController = require("../controllers/aisController");
const authController = require("../controllers/authController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get("/ais", authController.isLoggedIn, aisController.getIndex);

// Parties
router.get("/ais/parties", authController.isLoggedIn, aisController.getParties);
router.get("/ais/parties/create", authController.isLoggedIn, aisController.getCreateParty);
router.post("/ais/parties/create", authController.isLoggedIn, aisController.postCreateParty);
router.get("/ais/parties/:id/edit", authController.isLoggedIn, aisController.getEditParty);
router.post("/ais/parties/:id/edit", authController.isLoggedIn, aisController.postEditParty);
router.post("/ais/parties/:id/delete", authController.isLoggedIn, aisController.postDeleteParty);

// COA
router.get("/ais/coa", authController.isLoggedIn, aisController.getAccounts);
router.get("/ais/coa/create", authController.isLoggedIn, aisController.getCreateAccount);
router.post("/ais/coa/create", authController.isLoggedIn, aisController.postCreateAccount);

// Entries
router.get("/ais/entries", authController.isLoggedIn, aisController.getEntries);

module.exports = router;