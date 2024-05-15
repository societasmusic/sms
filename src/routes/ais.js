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
router.get("/ais/parties/create", authController.isLoggedIn, authController.isEditor, aisController.getCreateParty);
router.post("/ais/parties/create", authController.isLoggedIn, authController.isEditor, aisController.postCreateParty);
router.get("/ais/parties/:id", authController.isLoggedIn, aisController.getViewParty);
router.get("/ais/parties/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.getEditParty);
router.post("/ais/parties/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.postEditParty);
router.post("/ais/parties/:id/delete", authController.isLoggedIn, authController.isAdmin, aisController.postDeleteParty);
router.get("/ais/parties/export/csv", authController.isLoggedIn, aisController.getExportCsvParties);

// COA
router.get("/ais/coa", authController.isLoggedIn, aisController.getAccounts);
router.get("/ais/coa/create", authController.isLoggedIn, authController.isEditor, aisController.getCreateAccount);
router.post("/ais/coa/create", authController.isLoggedIn, authController.isEditor, aisController.postCreateAccount);
router.get("/ais/coa/:id", authController.isLoggedIn, aisController.getViewAccount);
router.get("/ais/coa/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.getEditAccount);
router.post("/ais/coa/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.postEditAccount);
router.post("/ais/coa/:id/delete", authController.isLoggedIn, authController.isAdmin, aisController.postDeleteAccount);
router.get("/ais/coa/export/csv", authController.isLoggedIn, aisController.getExportCsvAccounts);

// Entries
router.get("/ais/entries", authController.isLoggedIn, aisController.getEntries);
router.get("/ais/entries/create", authController.isLoggedIn, authController.isEditor, aisController.getCreateEntry);
router.post("/ais/entries/create", authController.isLoggedIn, authController.isEditor, upload.single("attachment"), aisController.postCreateEntry);
router.get("/ais/entries/:id", authController.isLoggedIn, aisController.getViewEntry);
router.get("/ais/entries/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.getEditEntry);
router.post("/ais/entries/:id/edit", authController.isLoggedIn, authController.isEditor, upload.single("attachment"), aisController.postEditEntry);
router.post("/ais/entries/:id/delete", authController.isLoggedIn, authController.isAdmin, aisController.postDeleteEntry);
router.get("/ais/entries/export/csv", authController.isLoggedIn, aisController.getExportCsvEntries);

// Invengofy
router.get("/ais/inventory", authController.isLoggedIn, aisController.getInventory);
router.get("/ais/inventory/create", authController.isLoggedIn, authController.isEditor, aisController.getCreateInventory);
// router.post("/ais/inventory/create", authController.isLoggedIn, authController.isEditor, aisController.postCreateInventory);
// router.get("/ais/inventory/:id", authController.isLoggedIn, aisController.getViewInventory);
// router.get("/ais/inventory/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.getEditInventory);
// router.post("/ais/inventory/:id/edit", authController.isLoggedIn, authController.isEditor, aisController.postEditInventory);
// router.post("/ais/inventory/:id/delete", authController.isLoggedIn, authController.isAdmin, aisController.postDeleteInventory);
// router.get("/ais/inventory/export/csv", authController.isLoggedIn, aisController.getExportCsvInventory);

module.exports = router;