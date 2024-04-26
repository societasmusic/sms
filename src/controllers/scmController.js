var pjson = require('../../package.json');
const User = require("../models/userModel");
const Vendor = require("../models/vendorModel");
const fs = require('fs');

var countries;
fs.readFile("src/data/countries.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        countries = JSON.parse(data);
    }
});
var businesscategories;
fs.readFile("src/data/businesscategories.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        businesscategories = JSON.parse(data);
    }
});

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
    let perPage = req.query.limit || 100;
    let page = req.query.p || 1;
    const allVendors = await Vendor.find();
    const count = allVendors.length;
    const vendors = await Vendor.aggregate([{ $sort: { fname: 1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
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
        current: page,
        perPage,
        count,
        pages: Math.ceil(count / perPage),
    });
};

exports.getCreateVendor = async (req, res) => {
    const title = "Create Vendor";
    const vendors = await Vendor.find();
    const messages = await req.flash("info");
    res.render("scm/vendors/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/scm/vendors",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        vendors,
        countries,
        businesscategories,
    });
};

exports.postCreateVendor = async (req, res) => {
    // Check if any blank inputs
    if (req.body.status == "" || req.body.legalName == "" || req.body.businessType == "" || req.body.taxTerritory == "" || req.body.businessCategory == "") {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/create`);
    };
    // Check email regex
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.trim()) == false && req.body.email.trim() != "") {
        await req.flash("info", "Incorrect email format. Please try again.");
        return res.redirect(`/scm/vendors/create`);
    };
    // Check status values
    if (req.body.status != "Enabled" || req.body.status != "Disabled") {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/create`);
    };
    // Check preset arrays
    if (!businesscategories.includes(req.body.businessCategory)) {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/create`);
    };
    // Define object
    const vendor = new Vendor({
        createdBy: req.user.id,
        updatedBy: req.user.id,
        status: req.body.status,
        legalName: req.body.legalName,
        businessType: req.body.businessType,
        taxTerritory: req.body.taxTerritory,
        businessCategory: req.body.businessCategory,
        email: req.body.email,
        phone: req.body.phone,
        altPhone: req.body.altPhone,
        address: [
            {
                line1: req.body.line1,
                line2: req.body.line2,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip,
                country: req.body.country,
            }
        ],
    });
    // Save to db
    try {
        await vendor.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/scm/vendors");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/scm/vendors/create");
    }
};