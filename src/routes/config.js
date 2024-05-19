const express = require("express");
const router = express.Router();
const indexController = require("../controllers/config/indexController");
const authController = require("../controllers/authController");

router.get("/config", authController.isLoggedIn, indexController.getIndex);

// Parties
// router.get("/ais/parties", authController.isLoggedIn, partyController.getParties);
// router.get("/ais/parties/create", authController.isLoggedIn, authController.isEditor, partyController.getCreateParty);
// router.post("/ais/parties/create", authController.isLoggedIn, authController.isEditor, partyController.postCreateParty);
// router.get("/ais/parties/:id", authController.isLoggedIn, partyController.getViewParty);
// router.get("/ais/parties/:id/edit", authController.isLoggedIn, authController.isEditor, partyController.getEditParty);
// router.post("/ais/parties/:id/edit", authController.isLoggedIn, authController.isEditor, partyController.postEditParty);
// router.post("/ais/parties/:id/delete", authController.isLoggedIn, authController.isAdmin, partyController.postDeleteParty);
// router.get("/ais/parties/export/csv", authController.isLoggedIn, partyController.getExportCsvParties);

module.exports = router;