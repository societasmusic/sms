var pjson = require('../../package.json');
const User = require("../models/userModel");
const Vendor = require("../models/vendorModel");
const Item = require("../models/itemModel");
const fs = require('fs');
const {downloadCsvResource} = require("../utils/json-csv");
const {downloadXmlResource} = require("../utils/json-xml");

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
var years;
fs.readFile("src/data/years.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        years = JSON.parse(data);
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
    let perPage = Number(req.query.limit) || 100;
    let page = req.query.p || 1;
    const allVendors = await Vendor.find();
    const count = allVendors.length;
    const vendors = await Vendor.aggregate([{ $sort: { legalName: 1 }}])
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
    if (!["Enabled","Disabled"].includes(req.body.status)) {
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
        tin: req.body.tin,
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

exports.getVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({_id: req.params.id});
        const createdBy = await User.findOne({_id: vendor.createdBy});
        const updatedBy = await User.findOne({_id: vendor.updatedBy});
        const title = `Vendor: ${vendor.legalName}`;
        const messages = await req.flash("info");
        res.render("scm/vendors/view", {
            vendor,
            user: req.user,
            urlraw: req.url,
            urlreturn: "/scm/vendors",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            createdBy: `${createdBy.fname} ${createdBy.lname}`,
            updatedBy: `${updatedBy.fname} ${updatedBy.lname}`,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/scm/vendors");
    }
};

exports.getEditVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({_id: req.params.id});
        const title = `Edit: ${vendor.legalName}`;
        const messages = await req.flash("info");
        res.render("scm/vendors/edit", {
            vendor,
            user: req.user,
            urlraw: req.url,
            urlreturn: `/scm/vendors/${vendor.id}`,
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            countries,
            businesscategories,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/scm/vendors");
    }
};

exports.postEditVendor = async (req, res) => {
    // Check if any blank inputs
    if (req.body.status == "" || req.body.legalName == "" || req.body.businessType == "" || req.body.taxTerritory == "" || req.body.businessCategory == "") {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    };
    // Check email regex
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.trim()) == false && req.body.email.trim() != "") {
        await req.flash("info", "Incorrect email format. Please try again.");
        return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    };
    // Check status values
    if (!["Enabled","Disabled"].includes(req.body.status)) {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    };
    // Check preset arrays
    if (!businesscategories.includes(req.body.businessCategory)) {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    };
    // Save to db
    try {
        await Vendor.findByIdAndUpdate(req.params.id, {
            updatedBy: req.user.id,
            status: req.body.status,
            legalName: req.body.legalName,
            tin: req.body.tin,
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
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/scm/vendors/${req.params.id}`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    }
};

exports.postDeleteVendor = async (req, res) => {
    try {
        await Vendor.findByIdAndDelete(req.params.id);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/scm/vendors`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    }
};

exports.getExportCsvVendor = async (req, res) => {
    try {
        const data = await Vendor.find({});
        const fields = [
            {
                label: "id",
                value: "_id",
            },
            {
                label: "legalName",
                value: "legalName",
            },
            {
                label: "email",
                value: "email",
            },
            {
                label: "phone",
                value: "phone",
            },
            {
                label: "altPhone",
                value: "altPhone",
            },
            {
                label: "status",
                value: "status",
            },
            {
                label: "businessCategory",
                value: "businessCategory",
            },
            {
                label: "businessType",
                value: "businessType",
            },
            {
                label: "taxTerritory",
                value: "taxTerritory",
            },
            {
                label: "address",
                value: "address[0].line1",
            },
            {
                label: "address2",
                value: "address[0].line2",
            },
            {
                label: "city",
                value: "address[0].city",
            },
            {
                label: "state",
                value: "address[0].state",
            },
            {
                label: "zip",
                value: "address[0].zip",
            },
            {
                label: "country",
                value: "address[0].country",
            },
            {
                label: "createdAt",
                value: "createdAt",
            },
            {
                label: "createdBy",
                value: "createdBy",
            },
            {
                label: "updatedAt",
                value: "updatedAt",
            },
            {
                label: "updatedBy",
                value: "updatedBy",
            },
        ];
        const fileNameClean = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "");
        return downloadCsvResource(res, `vendors-${fileNameClean}.csv`, fields, data);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors`);
    }
};

exports.getExportXmlVendor = async (req, res) => {
    try {
        const data = await Vendor.find({});
        const fileNameClean = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "");
        return downloadXmlResource(res, `vendors-${fileNameClean}.xml`, data);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors`);
    }
};

exports.getSearchVendors = async (req, res) => {
    try {
        let q = req.query.q;
        let perPage = Number(req.query.limit) || 100;
        let page = req.query.p || 1;
        const searchNoSpecialChar = q.replace(/[^a-zA-Z0-9 ]/g, "");
        const allVendors = await Vendor.find({$or: [{ legalName: { $regex: new RegExp(searchNoSpecialChar, "i")}}]});
        const count = allVendors.length;
        const vendors = await Vendor.find({$or: [{ legalName: { $regex: new RegExp(searchNoSpecialChar, "i")}}]}).skip(perPage * page - perPage).limit(perPage).exec();
        const messages = await req.flash("info");
        const title = `Vendor Search`;
        res.render("scm/vendors/search", {
            user: req.user,
            urlraw: req.url,
            urlreturn: "/scm/vendors",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            vendors,
            current: page,
            perPage,
            count,
            pages: Math.ceil(count / perPage),
            q,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/vendors`);
    };
};

exports.getInventory = async (req, res) => {
    const title = "Inventory";
    let perPage = Number(req.query.limit) || 100;
    let page = req.query.p || 1;
    const allItems = await Item.find();
    const count = allItems.length;
    const items = await Item.aggregate([{ $sort: { legalName: 1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const messages = await req.flash("info");
    res.render("scm/inventory", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/scm",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        items,
        current: page,
        perPage,
        count,
        pages: Math.ceil(count / perPage),
    });
};

exports.getCreateItem = async (req, res) => {
    const title = "Create Item";
    const messages = await req.flash("info");
    const items = await Item.find({});
    res.render("scm/inventory/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/scm/inventory",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        countries,
        businesscategories,
        items,
        years,
    });
};

exports.postCreateItem = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.itemNumberSeries == "" || req.body.itemNumberText == "" || req.body.itemType == "") {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/inventory/create`);
    };
    // // Check email regex
    // if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.trim()) == false && req.body.email.trim() != "") {
    //     await req.flash("info", "Incorrect email format. Please try again.");
    //     return res.redirect(`/scm/vendors/${req.params.id}/edit`);
    // };
    // Check status values
    // if (!years.includes(req.body.cLineYear) && req.body.cLineYear != "" || !years.includes(req.body.pLineYear) && req.body.pLineYear != "") {
    //     await req.flash("info", "There was an error processing your request.");
    //     return res.redirect(`/scm/inventory/create`);
    // };
    // Define object
    const item = new Item({
        createdBy: req.user.id,
            updatedBy: req.user.id,
            name: req.body.name,
            version: req.body.version,
            subItemOf: req.body.subItemOf,
            itemType: req.body.itemType,
            itemNumber: {
                itemNumberSeries: req.body.itemNumberSeries,
                itemNumberText: req.body.itemNumberText,
            },
            itemImage: req.body.itemImage,
            itemLabel: req.body.itemLabel,
            cLine: [
                {
                    cLineYear: req.body.cLineYear,
                    cLineText: req.body.cLineText,
                }
            ],
            pLine: [
                {
                    pLineYear: req.body.pLineYear,
                    pLineText: req.body.pLineText,
                }
            ],
    });
    // Save to db
    try {
        await item.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/scm/inventory`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/scm/inventory/create`);
    }
};