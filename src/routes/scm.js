const express = require("express");
const router = express.Router();
const scmController = require("../controllers/scmController");
const authController = require("../controllers/authController");

router.get("/scm", authController.isLoggedIn, scmController.getIndex);

// Vendors
router.get("/scm/vendors", authController.isLoggedIn, scmController.getVendors);
router.get("/scm/vendors/create", authController.isLoggedIn, authController.isEditor, scmController.getCreateVendor);
router.post("/scm/vendors/create", authController.isLoggedIn, authController.isEditor, scmController.postCreateVendor);
router.get("/scm/vendors/search", authController.isLoggedIn, scmController.getSearchVendors);
router.get("/scm/vendors/export/csv", authController.isLoggedIn, scmController.getExportCsvVendor);
router.get("/scm/vendors/export/xml", authController.isLoggedIn, scmController.getExportXmlVendor);
router.get("/scm/vendors/:id", authController.isLoggedIn, scmController.getVendor);
router.get("/scm/vendors/:id/edit", authController.isLoggedIn, authController.isEditor, scmController.getEditVendor);
router.post("/scm/vendors/:id/edit", authController.isLoggedIn, authController.isEditor, scmController.postEditVendor);
router.post("/scm/vendors/:id/delete", authController.isLoggedIn, authController.isAdmin, scmController.postDeleteVendor);

// Inventory
router.get("/scm/inventory", authController.isLoggedIn, scmController.getInventory);
router.get("/scm/inventory/create", authController.isLoggedIn, authController.isEditor, scmController.getCreateItem);
router.post("/scm/inventory/create", authController.isLoggedIn, authController.isEditor, scmController.postCreateItem);

module.exports = router;