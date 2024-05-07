var pjson = require('../../package.json');
const Party = require("../models/partyModel");
const Account = require("../models/accountModel");
const Entry = require("../models/entryModel");
const fs = require('fs');
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const {downloadCsvResource} = require("../utils/json-csv");
const {downloadXmlResource} = require("../utils/json-xml");

/*
    Initialization
*/
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.BUCKET_REGION
});
var countries;
fs.readFile("src/data/countries.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        countries = JSON.parse(data);
    }
});
var languages;
fs.readFile("src/data/languages.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        languages = JSON.parse(data);
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
var itemTypes;
fs.readFile("src/data/itemTypes.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        itemTypes = JSON.parse(data);
    }
});
var currencies;
fs.readFile("src/data/currencies.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        currencies = JSON.parse(data);
    }
});

exports.getIndex = async (req, res) => {
    const title = "Accounting Information System (AIS)";
    const messages = await req.flash("info");
    res.render("ais", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/dashboard",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};

/*
    Accounts
*/

// Get Index 
exports.getAccounts = async (req, res) => {
    const title = "Chart of Accounts";
    let perPage = Number(req.query.limit) || 100;
    let page = req.query.p || 1;
    const allAccounts = await Account.find();
    const count = allAccounts.length;
    const accounts = await Account.aggregate([{ $sort: { type: 1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const messages = await req.flash("info");
    res.render("ais/coa", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        accounts,
        current: page,
        perPage,
        count,
        pages: Math.ceil(count / perPage),
    });
};
// Get Create Account
exports.getCreateAccount = async (req, res) => {
    const title = "Create Account";
    const messages = await req.flash("info");
    res.render("ais/coa/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais/coa",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        countries,
        businesscategories,
        currencies,
    });
};
// Post Create Account
exports.postCreateAccount = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.type == "") {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa/create`);
    };
    // Check preset arrays
    if (!["1100","1200","2100","2200","3000","4000","5000"].includes(req.body.type)) {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa/create`);
    };
    // Define number
    var number;
    const accounts = await Account.find({"type":req.body.type});
    if (accounts < 1) {
        number = Number(req.body.type) + 1;
    } else {
        const accountsSorted = [];
        accounts.forEach(e => {
            accountsSorted.push(e.number);
        });
        number = Number(Math.max(...accountsSorted) + 1);
    };
    // Check if item number already exists
    const existingAccount = await Account.findOne({"number":number});
    if (existingAccount) {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa/create`);
    };
    // Define object
    const account = new Account({
        createdBy: req.user.id,
        updatedBy: req.user.id,
        name: req.body.name,
        type: req.body.type,
        number: number,
    });
    // Save to db
    try {
        await account.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/ais/coa");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/coa/create");
    }
};

/*
    Parties
*/

// Get Index 
exports.getParties = async (req, res) => {
    const title = "Parties";
    let perPage = Number(req.query.limit) || 100;
    let page = req.query.p || 1;
    const allParties = await Party.find();
    const count = allParties.length;
    const parties = await Party.aggregate([{ $sort: { legalName: 1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec()
    const messages = await req.flash("info");
    res.render("ais/parties", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        parties,
        current: page,
        perPage,
        count,
        pages: Math.ceil(count / perPage),
    });
};
// Get Create Party
exports.getCreateParty = async (req, res) => {
    const title = "Create Party";
    const messages = await req.flash("info");
    const accounts = await Account.find({});
    res.render("ais/parties/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais/parties",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        countries,
        businesscategories,
        currencies,
        accounts,
    });
};
// Post Create Party
exports.postCreateParty = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.partyType == "" || req.body.businessType == "" || req.body.territory == "" || req.body.category == "" || req.body.currency == "" || req.body.billingAccount == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/parties/create`);
    };
    // Check email regex
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.trim()) == false && req.body.email.trim() != "") {
        console.log("2");
        await req.flash("info", "Incorrect email format. Please try again.");
        return res.redirect(`/ais/parties/create`);
    };
    // Check party type values
    if (!["Customer","Partner","Vendor","Other"].includes(req.body.partyType)) {
        console.log("3");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/create`);
    };
    // Check preset arrays
    // const accounts = await Account.find({});
    // if (!accounts.includes(req.body.billingAccount)) {
    //     console.log("4");
    //     await req.flash("info", "There was an error processing your request.");
    //     return res.redirect(`/ais/parties/create`);
    // };
    // Check preset arrays
    if (!businesscategories.includes(req.body.category)) {
        console.log("5");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/create`);
    };
    // Define object
    const party = new Party({
        createdBy: req.user.id,
        updatedBy: req.user.id,
        name: req.body.name,
        partyType: req.body.partyType,
        billingAccount: req.body.billingAccount,
        tin: req.body.tin,
        businessType: req.body.businessType,
        territory: req.body.territory,
        currency: req.body.currency,
        category: req.body.category,
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
        await party.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/ais/parties");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/parties/create");
    }
};
// Get Edit Party
exports.getEditParty = async (req, res) => {
    const title = "Edit Party";
    const messages = await req.flash("info");
    const accounts = await Account.find({});
    const party = await Party.findOne({_id: req.params.id});
    res.render("ais/parties/edit", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais/parties",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        countries,
        businesscategories,
        currencies,
        accounts,
        party,
    });
};
// Post Edit Party
exports.postEditParty = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.partyType == "" || req.body.businessType == "" || req.body.territory == "" || req.body.category == "" || req.body.currency == "" || req.body.billingAccount == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/parties/create`);
    };
    // Check email regex
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.trim()) == false && req.body.email.trim() != "") {
        console.log("2");
        await req.flash("info", "Incorrect email format. Please try again.");
        return res.redirect(`/ais/parties/create`);
    };
    // Check party type values
    if (!["Customer","Partner","Vendor","Other"].includes(req.body.partyType)) {
        console.log("3");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/create`);
    };
    // Check preset arrays
    // const accounts = await Account.find({});
    // if (!accounts.includes(req.body.billingAccount)) {
    //     console.log("4");
    //     await req.flash("info", "There was an error processing your request.");
    //     return res.redirect(`/ais/parties/create`);
    // };
    // Check preset arrays
    if (!businesscategories.includes(req.body.category)) {
        console.log("5");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/create`);
    };
    // Define object
    const party = {
        createdBy: req.user.id,
        updatedBy: req.user.id,
        name: req.body.name,
        partyType: req.body.partyType,
        billingAccount: req.body.billingAccount,
        tin: req.body.tin,
        businessType: req.body.businessType,
        territory: req.body.territory,
        currency: req.body.currency,
        category: req.body.category,
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
    };
    // Save to db
    try {
        await Party.findByIdAndUpdate(req.params.id, party);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/ais/parties");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/parties/create");
    }
};
// Post Delete Party
exports.postDeleteParty = async (req, res) => {
    try {
        await Party.findByIdAndDelete(req.params.id);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/parties`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties`);
    }
};

/*
    Entries
*/

// Get Index 
exports.getEntries = async (req, res) => {
    const title = "Entries";
    let perPage = Number(req.query.limit) || 100;
    let page = req.query.p || 1;
    const allEntries = await Entry.find();
    const count = allEntries.length;
    const entries = await Entry.aggregate([{ $sort: { legalName: 1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const messages = await req.flash("info");
    res.render("ais/entries", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        entries,
        current: page,
        perPage,
        count,
        pages: Math.ceil(count / perPage),
    });
};