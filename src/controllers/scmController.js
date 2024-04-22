var pjson = require('../../package.json');
const User = require("../models/userModel");
const Vendor = require("../models/vendorModel");
const fs = require('fs');

exports.getIndex = async (req, res) => {
    const title = "Supply Chain Management (SCM)";
    const messages = await req.flash("info");
    res.render("scm/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/dashboard",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};

exports.getVendors = async (req, res) => {
    const title = "Vendors";
    const vendors = await Vendor.find();
    const messages = await req.flash("info");
    res.render("scm/vendors/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/scm",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        vendors,
    });
};