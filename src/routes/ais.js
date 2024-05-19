const express = require("express");
const router = express.Router();
const indexController = require("../controllers/ais/indexController");
const partyController = require("../controllers/ais/partyController");
const accountController = require("../controllers/ais/accountController");
const entryController = require("../controllers/ais/entryController");
const inventoryController = require("../controllers/ais/inventoryController");
const authController = require("../controllers/authController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get("/ais", authController.isLoggedIn, indexController.getIndex);

// Parties
router.get("/ais/parties", authController.isLoggedIn, partyController.getParties);
router.get("/ais/parties/create", authController.isLoggedIn, authController.isEditor, partyController.getCreateParty);
router.post("/ais/parties/create", authController.isLoggedIn, authController.isEditor, partyController.postCreateParty);
router.get("/ais/parties/:id", authController.isLoggedIn, partyController.getViewParty);
router.get("/ais/parties/:id/edit", authController.isLoggedIn, authController.isEditor, partyController.getEditParty);
router.post("/ais/parties/:id/edit", authController.isLoggedIn, authController.isEditor, partyController.postEditParty);
router.post("/ais/parties/:id/delete", authController.isLoggedIn, authController.isAdmin, partyController.postDeleteParty);
router.get("/ais/parties/export/csv", authController.isLoggedIn, partyController.getExportCsvParties);

// COA
router.get("/ais/coa", authController.isLoggedIn, accountController.getAccounts);
router.get("/ais/coa/create", authController.isLoggedIn, authController.isEditor, accountController.getCreateAccount);
router.post("/ais/coa/create", authController.isLoggedIn, authController.isEditor, accountController.postCreateAccount);
router.get("/ais/coa/:id", authController.isLoggedIn, accountController.getViewAccount);
router.get("/ais/coa/:id/edit", authController.isLoggedIn, authController.isEditor, accountController.getEditAccount);
router.post("/ais/coa/:id/edit", authController.isLoggedIn, authController.isEditor, accountController.postEditAccount);
router.post("/ais/coa/:id/delete", authController.isLoggedIn, authController.isAdmin, accountController.postDeleteAccount);
router.get("/ais/coa/export/csv", authController.isLoggedIn, accountController.getExportCsvAccounts);

// Entries
router.get("/ais/entries", authController.isLoggedIn, entryController.getEntries);
router.get("/ais/entries/create", authController.isLoggedIn, authController.isEditor, entryController.getCreateEntry);
router.post("/ais/entries/create", authController.isLoggedIn, authController.isEditor, upload.single("attachment"), entryController.postCreateEntry);
router.get("/ais/entries/:id", authController.isLoggedIn, entryController.getViewEntry);
router.get("/ais/entries/:id/edit", authController.isLoggedIn, authController.isEditor, entryController.getEditEntry);
router.post("/ais/entries/:id/edit", authController.isLoggedIn, authController.isEditor, upload.single("attachment"), entryController.postEditEntry);
router.post("/ais/entries/:id/delete", authController.isLoggedIn, authController.isAdmin, entryController.postDeleteEntry);
router.get("/ais/entries/export/csv", authController.isLoggedIn, entryController.getExportCsvEntries);

// Invengofy
router.get("/ais/inventory", authController.isLoggedIn, inventoryController.getInventory);
router.get("/ais/inventory/create", authController.isLoggedIn, authController.isEditor, inventoryController.getCreateInventory);
router.post("/ais/inventory/create", authController.isLoggedIn, authController.isEditor, inventoryController.postCreateInventory);
router.get("/ais/inventory/:id", authController.isLoggedIn, inventoryController.getViewInventory);
router.get("/ais/inventory/:id/edit", authController.isLoggedIn, authController.isEditor, inventoryController.getEditInventory);
router.post("/ais/inventory/:id/edit", authController.isLoggedIn, authController.isEditor, inventoryController.postEditInventory);
router.post("/ais/inventory/:id/delete", authController.isLoggedIn, authController.isAdmin, inventoryController.postDeleteInventory);
// router.get("/ais/inventory/export/csv", authController.isLoggedIn, inventoryController.getExportCsvInventory);

module.exports = router;