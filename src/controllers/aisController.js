var pjson = require('../../package.json');
const Party = require("../models/partyModel");
const Account = require("../models/accountModel");
const User = require("../models/userModel");
const Item = require("../models/itemModel");
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
let roles;
fs.readFile("src/data/roles.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        roles = JSON.parse(data);
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
    const entries = await Entry.find();
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
        entries,
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
// Get View Account
exports.getViewAccount = async (req, res) => {
    try {
        const messages = await req.flash("info");
        const account = await Account.findOne({_id: req.params.id});
        const title = `${account.number} - ${account.name}`;
        var createdByUser;
        try {
            createdByUser = await User.findById(account.createdBy);
            createdByUser = `${createdByUser.fname} ${createdByUser.lname}`;
        } catch (err) {
            createdByUser = "System";
        };
        var updatedByUser;
        try {
            updatedByUser = await User.findById(account.updatedBy);
            updatedByUser = `${updatedByUser.fname} ${updatedByUser.lname}`;
        } catch (err) {
            updatedByUser = "System";
        };
        res.render("ais/coa/view", {
            user: req.user,
            urlraw: req.url,
            urlreturn: "/ais/coa",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            account,
            createdByUser,
            updatedByUser,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/coa");
    }
}
// Get Edit Account
exports.getEditAccount = async (req, res) => {
    try {
        const title = "Edit Account";
        const messages = await req.flash("info");
        const account = await Account.findOne({_id: req.params.id});
        res.render("ais/coa/edit", {
            user: req.user,
            urlraw: req.url,
            urlreturn: `/ais/coa/${req.params.id}`,
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            account,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/coa");
    }
};
// Post Edit Account
exports.postEditAccount = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "") {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa/${req.params.id}/edit`);
    };
    // Define object
    const account = {
        updatedBy: req.user.id,
        name: req.body.name,
    };
    // Save to db
    try {
        await Account.findByIdAndUpdate(req.params.id, account);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/coa/`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa/${req.params.id}/edit`);
    }
};
// Post Delete Account
exports.postDeleteAccount = async (req, res) => {
    try {
        await Account.findByIdAndDelete(req.params.id);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/coa`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa`);
    }
};
// Export CSV
exports.getExportCsvAccounts = async (req, res) => {
    try {
        const data = await Account.find({});
        const fields = [
            {
                label: "id",
                value: "_id",
            },
            {
                label: "name",
                value: "name",
            },
            {
                label: "number",
                value: "number",
            },
            {
                label: "type",
                value: "type",
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
        return downloadCsvResource(res, `accounts-${fileNameClean}.csv`, fields, data);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/coa`);
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
// Get View Party
exports.getViewParty = async (req, res) => {
    try {
        const messages = await req.flash("info");
        const party = await Party.findOne({_id: req.params.id});
        const title = `${party.name}`;
        var createdByUser;
        try {
            createdByUser = await User.findById(party.createdBy);
            createdByUser = `${createdByUser.fname} ${createdByUser.lname}`;
        } catch (err) {
            createdByUser = "System";
        };
        var updatedByUser;
        try {
            updatedByUser = await User.findById(party.updatedBy);
            updatedByUser = `${updatedByUser.fname} ${updatedByUser.lname}`;
        } catch (err) {
            updatedByUser = "System";
        };
        var billingAccount;
        try {
            const account = await Account.findOne({number: party.billingAccount});
            billingAccount = `${party.billingAccount} - ${account.name}`
        } catch (err) {
            console.log(err);
            billingAccount = "None"
        };
        res.render("ais/parties/view", {
            user: req.user,
            urlraw: req.url,
            urlreturn: "/ais/parties",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            party,
            createdByUser,
            updatedByUser,
            billingAccount,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/parties");
    }
}
// Get Edit Party
exports.getEditParty = async (req, res) => {
    try {
        const title = "Edit Party";
        const messages = await req.flash("info");
        const accounts = await Account.find({});
        const party = await Party.findOne({_id: req.params.id});
        res.render("ais/parties/edit", {
            user: req.user,
            urlraw: req.url,
            urlreturn: `/ais/parties/${req.params.id}`,
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
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/parties");
    }
};
// Post Edit Party
exports.postEditParty = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.partyType == "" || req.body.businessType == "" || req.body.territory == "" || req.body.category == "" || req.body.currency == "" || req.body.billingAccount == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/parties/${req.params.id}/edit`);
    };
    // Check email regex
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.trim()) == false && req.body.email.trim() != "") {
        console.log("2");
        await req.flash("info", "Incorrect email format. Please try again.");
        return res.redirect(`/ais/parties/${req.params.id}/edit`);
    };
    // Check party type values
    if (!["Customer","Partner","Vendor","Other"].includes(req.body.partyType)) {
        console.log("3");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/${req.params.id}/edit`);
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
        return res.redirect(`/ais/parties/${req.params.id}/edit`);
    };
    // Define object
    const party = {
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
        return res.redirect(`/ais/parties/${req.params.id}`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/${req.params.id}/edit`);
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
// Export CSV
exports.getExportCsvParties = async (req, res) => {
    try {
        const data = await Party.find({});
        const fields = [
            {
                label: "id",
                value: "_id",
            },
            {
                label: "name",
                value: "name",
            },
            {
                label: "partyType",
                value: "partyType",
            },
            {
                label: "category",
                value: "category",
            },
            {
                label: "tin",
                value: "tin",
            },
            {
                label: "businessType",
                value: "businessType",
            },
            {
                label: "territory",
                value: "territory",
            },
            {
                label: "billingAccount",
                value: "billingAccount",
            },
            {
                label: "currency",
                value: "currency",
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
        return downloadCsvResource(res, `parties-${fileNameClean}.csv`, fields, data);
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
    const accounts = await Account.find();
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
        accounts,
    });
};
// Get Create Entry
exports.getCreateEntry = async (req, res) => {
    const title = "Create Entry";
    const messages = await req.flash("info");
    const accounts = await Account.find();
    res.render("ais/entries/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais/entries",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        accounts,
    });
};
exports.postCreateEntry = async (req, res) => {
    // Check if any blank inputs
    if (req.body.date == "" || req.body.type == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/entries/create`);
    };
    // Check party type values
    if (!["Standard Entry","Compound Entry","Adjusting Entry","Transfer Entry","Opening Entry","Closing Entry","Reversing Entry"].includes(req.body.type)) {
        console.log("3");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/create`);
    };
    // Define number
    var number;
    const entries = await Entry.find();
    if (entries < 1) {
        number = 100000 + 1;
    } else {
        const entriesSorted = [];
        entries.forEach(e => {
            entriesSorted.push(e.number);
        });
        number = Number(Math.max(...entriesSorted) + 1);
    };
    // Upload files to s3 bucket
    var fileName;
    if (req.file != "" && req.file) {
        const fileNameClean = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "");
        const securityKey = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
        var fileExt;
        if (req.file.mimetype == "image/png") {
            fileExt = "png"
        } else if (req.file.mimetype == "image/jpeg") {
            fileExt = "jpeg"
        } else if (req.file.mimetype == "application/pdf") {
            fileExt = "pdf"
        } else {
            await req.flash("info", "There was an error processing your request.");
            return res.redirect(`/ais/entries/create`);
        };
        fileName = `attachment-${fileNameClean}-${securityKey()}.${fileExt}`
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
    } else {
        fileName = "";
    };
    // Validate and Define Rows
    if (req.body.account.length < 2 || !Array.isArray(req.body.account)) {
        console.log("4");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/create`);
    };
    let debits = 0;
    let credits = 0;
    req.body.debit.forEach((e) => {
        debits = debits + Number(e);
    });
    req.body.credit.forEach((e) => {
        credits = credits + Number(e);
    });
    if (debits.toFixed(2) != credits.toFixed(2)) {
        console.log(req.body.debit);
        console.log(req.body.credit);
        console.log(debits);
        console.log(credits);
        console.log("6");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/create`);
    };
    const rows = [];
    let i = 0;
    req.body.account.forEach((e) => {
        let row = {
            account: e,
            debit: req.body.debit[i],
            credit: req.body.credit[i],
        };
        rows.push(row);
        i++;
    });
    // Define Main Object
    const entry = new Entry({
        date: req.body.date,
        type: req.body.type,
        number: number,
        rows: rows,
        reference: {
            number: req.body.refNumber,
            date: req.body.refDate,
            remark: req.body.refRemark,
            attachment: fileName,
        },
        approval: {
            status: "Pending Approval"
        },
        createdBy: req.user.id,
        updatedBy: req.user.id,
    });
    // Save to db
    try {
        await entry.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/entries`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/create`);
    }
};
exports.getViewEntry = async (req, res) => {
    try {
        const messages = await req.flash("info");
        const entry = await Entry.findOne({_id: req.params.id});
        const date = entry.date.toISOString().slice(0,10)
        const title = `${date} - ${entry.number}`;
        let createdByUser;
        try {
            createdByUser = await User.findById(entry.createdBy);
            createdByUser = `${createdByUser.fname} ${createdByUser.lname}`;
        } catch (err) {
            createdByUser = "System";
        };
        let updatedByUser;
        try {
            updatedByUser = await User.findById(entry.updatedBy);
            updatedByUser = `${updatedByUser.fname} ${updatedByUser.lname}`;
        } catch (err) {
            updatedByUser = "System";
        };
        let approvedByUser;
        try {
            approvedByUser = await User.findById(entry.approval.approvedBy);
            approvedByUser = `${approvedByUser.fname} ${approvedByUser.lname}`;
        } catch (err) {
            approvedByUser = "System";
        };
        let attachmentUrl;
        if (entry.reference.attachment != "" && entry.reference.attachment) {
            const getObjectParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: entry.reference.attachment,
            };
            const command = new GetObjectCommand(getObjectParams);
            attachmentUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        };
        const accounts = await Account.find();
        res.render("ais/entries/view", {
            user: req.user,
            urlraw: req.url,
            urlreturn: "/ais/entries",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            entry,
            createdByUser,
            updatedByUser,
            approvedByUser,
            attachmentUrl,
            accounts,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/entries");
    }
};
// Get Edit Entry
exports.getEditEntry = async (req, res) => {
    try {
        const title = "Edit Entry";
        const messages = await req.flash("info");
        const accounts = await Account.find();
        const entry = await Entry.findOne({_id: req.params.id});
        var attachmentUrl;
        if (entry.reference.attachment != "" && entry.reference.attachment) {
            const getObjectParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: entry.reference.attachment,
            };
            const command = new GetObjectCommand(getObjectParams);
            attachmentUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        };
        if (req.user.access == "Editor" && entry.approval.status != "Pending Approval") {
            await req.flash("info", "There was an error processing your request.");
            return res.redirect("/ais/entries");
        };
        res.render("ais/entries/edit", {
            user: req.user,
            urlraw: req.url,
            urlreturn: "/ais/entries",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            accounts,
            entry,
            attachmentUrl,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/entries");
    };
};
exports.postEditEntry = async (req, res) => {
    // Check permissions
    if (req.user.access == "Editor" && req.body.status) {
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/ais/entries");
    };
    // Check if any blank inputs
    if (req.body.date == "" || req.body.type == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/entries/${req.params.id}/edit`);
    };
    // Check party type values
    if (!["Standard Entry","Compound Entry","Adjusting Entry","Transfer Entry","Opening Entry","Closing Entry","Reversing Entry"].includes(req.body.type)) {
        console.log("3");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/${req.params.id}/edit`);
    };
    // Upload files to s3 bucket
    var fileName;
    if (req.file != "" && req.file) {
        const fileNameClean = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(".", "");
        const securityKey = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
        var fileExt;
        if (req.file.mimetype == "image/png") {
            fileExt = "png"
        } else if (req.file.mimetype == "image/jpeg") {
            fileExt = "jpeg"
        } else if (req.file.mimetype == "application/pdf") {
            fileExt = "pdf"
        } else {
            await req.flash("info", "There was an error processing your request.");
            return res.redirect(`/ais/entries/${req.params.id}/edit`);
        };
        fileName = `attachment-${fileNameClean}-${securityKey()}.${fileExt}`
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
    } else {
        // Keep existing file if no new attachment is given
        try {
            const existingEntry = await Entry.findOne({_id:req.params.id});
            fileName = existingEntry.reference.attachment || "";
        } catch (err) {
            console.log(err);
            await req.flash("info", "There was an error processing your request.");
            return res.redirect(`/ais/entries/${req.params.id}/edit`);
        };
    };
    // Validate and Define Rows
    if (req.body.account.length < 2 && !Array.isArray(req.body.account)) {
        console.log("4");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/${req.params.id}/edit`);
    };
    let debits = 0;
    let credits = 0;
    req.body.debit.forEach((e) => {
        debits = debits + Number(e);
    });
    req.body.credit.forEach((e) => {
        credits = credits + Number(e);
    });
    if (debits.toFixed(2) != credits.toFixed(2)) {
        console.log("6");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/${req.params.id}/edit`);
    };
    const rows = [];
    let i = 0;
    req.body.account.forEach((e) => {
        let row = {
            account: e,
            debit: req.body.debit[i],
            credit: req.body.credit[i],
        };
        rows.push(row);
        i++;
    });
    // Validate status and approval
    let status;
    let approvedAt = new Date();
    let approvedBy;
    if (req.user.access == "System Administrator" || req.user.access == "System Owner") {
        if (!["Pending Approval","Approved","Cancelled"].includes(req.body.status)) {
            console.log("5");
            await req.flash("info", "There was an error processing your request.");
            return res.redirect(`/ais/entries/${req.params.id}/edit`);
        };
        status = req.body.status;
        approvedAt = approvedAt.toISOString();
        approvedBy = req.user._id;
    } else {
        status = "Pending Approval";
        approvedAt = "";
        approvedBy = "";
    };
    // Define Main Object
    const entry = {
        date: req.body.date,
        type: req.body.type,
        rows: rows,
        reference: {
            number: req.body.refNumber,
            date: req.body.refDate,
            remark: req.body.refRemark,
            attachment: fileName,
        },
        approval: {
            status: status,
            approvedAt: approvedAt,
            approvedBy: approvedBy,
        },
        updatedBy: req.user.id,
    };
    // Save to db
    try {
        await Entry.findByIdAndUpdate(req.params.id, entry);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/entries`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries/${req.params.id}/edit`);
    }
};
// Post Delete Entry
exports.postDeleteEntry = async (req, res) => {
    try {
        await Entry.findByIdAndDelete(req.params.id);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/entries`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries`);
    }
};
// Export CSV
exports.getExportCsvEntries = async (req, res) => {
    try {
        const data = await Entry.find({});
        const fields = [
            {
                label: "id",
                value: "_id",
            },
            {
                label: "date",
                value: "date",
            },
            {
                label: "number",
                value: "number",
            },
            {
                label: "type",
                value: "type",
            },
            {
                label: "approvedAt",
                value: "approval.approvedAt",
            },
            {
                label: "approvedBy",
                value: "approval.approvedBy",
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
        return downloadCsvResource(res, `entries-${fileNameClean}.csv`, fields, data);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/entries`);
    }
};

/*
    Inventory
*/
// Get Index
exports.getInventory = async (req, res) => {
    const title = "Inventory";
    const items = await Item.find();
    const messages = await req.flash("info");
    res.render("ais/inventory", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        items,
    });
};
// Get Create Item
exports.getCreateInventory = async (req, res) => {
    const title = "Create Item";
    const parties = await Party.find();
    const accounts = await Account.find();
    const messages = await req.flash("info");
    res.render("ais/inventory/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/ais/inventory",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        parties,
        accounts,
        roles,
        itemTypes,
    });
};
// Post Create Item
exports.postCreateInventory = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.type == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/inventory/create`);
    };
    // Check party type values
    if (!itemTypes.includes(req.body.type)) {
        console.log("2");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory/create`);
    };
    // Define number
    let number;
    const items = await Item.find();
    if (items < 1) {
        number = 100000 + 1;
    } else {
        const itemsSorted = [];
        items.forEach(e => {
            itemsSorted.push(e.number);
        });
        number = Number(Math.max(...itemsSorted) + 1);
    };
    // Validate and Define Rows
    let date = new Date;
    date = date.toISOString();
    let royalties = [];
    let recipient = {};
    if (Array.isArray(req.body.party)) {
        let i = 0;
        req.body.party.forEach(async (e) => {
            if (req.body.party[i] == "" || req.body.rate[i] == "" || req.body.maxReserveRate[i] == "" || req.body.threshold[i] == "") {
                console.log("3");
                await req.flash("info", "There was an error processing your request.");
                return res.redirect(`/ais/inventory/create`);
            };
            recipient = {
                party: e,
                rate: req.body.rate[i] / 100,
                maxReserveRate: req.body.maxReserveRate[i] / 100,
                threshold: req.body.threshold[i],
                createdAt: date,
            };
            royalties.push(recipient);
            i++;
        });
    } else {
        recipient = {
            party: req.body.party,
            rate: req.body.rate / 100,
            maxReserveRate: req.body.maxReserveRate / 100,
            threshold: req.body.threshold,
            createdAt: date,
        };
        royalties.push(recipient);
    };
    if (req.body.party == "") {
        royalties = [];
    };
    // Define Main Object
    const item = new Item({
        number: number,
        name: req.body.name,
        version: req.body.version,
        type: req.body.type,
        number: number,
        pricing: {
            rate: req.body.pricingRate,
            uom: req.body.uom,
        },
        royalties: royalties,
        createdBy: req.user.id,
        updatedBy: req.user.id,
    });
    // Save to db
    try {
        await item.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/inventory`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory/create`);
    }
};
// Get Item View
exports.getViewInventory = async (req, res) => {
    try {     
        const item = await Item.findOne({number: req.params.id});
        const title = `${item.name}`;
        const parties = await Party.find();
        const messages = await req.flash("info");
        let createdByUser;
        try {
            createdByUser = await User.findById(item.createdBy);
            createdByUser = `${createdByUser.fname} ${createdByUser.lname}`;
        } catch (err) {
            createdByUser = "System";
        };
        let updatedByUser;
        try {
            updatedByUser = await User.findById(item.updatedBy);
            updatedByUser = `${updatedByUser.fname} ${updatedByUser.lname}`;
        } catch (err) {
            updatedByUser = "System";
        };
        res.render("ais/inventory/view", {
            user: req.user,
            urlraw: req.url,
            urlreturn: "/ais/inventory",
            url: encodeURIComponent(req.url),
            title,
            pjson,
            item,
            messages,
            parties,
            createdByUser,
            updatedByUser,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory`);
    }
};
// Get Edit Item
exports.getEditInventory = async (req, res) => {
    try {
        const title = "Edit Item";
        const item = await Item.findOne({number: req.params.id});
        const parties = await Party.find();
        const accounts = await Account.find();
        const messages = await req.flash("info");
        res.render("ais/inventory/edit", {
            user: req.user,
            urlraw: req.url,
            urlreturn: `/ais/inventory/${item.number}`,
            url: encodeURIComponent(req.url),
            title,
            pjson,
            messages,
            item,
            parties,
            accounts,
            roles,
            itemTypes,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory`);
    }
};
// Post Edit Item
exports.postEditInventory = async (req, res) => {
    // Check if any blank inputs
    if (req.body.name == "" || req.body.type == "") {
        await req.flash("info", "There was an error processing your request.");
        console.log("1");
        return res.redirect(`/ais/inventory/${req.params.id}/edit`);
    };
    // Check party type values
    if (!itemTypes.includes(req.body.type)) {
        console.log("2");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory/${req.params.id}/edit`);
    };
    // Validate and Define Rows
    let date = new Date;
    date = date.toISOString();
    let royalties = [];
    let recipient = {};
    if (Array.isArray(req.body.party)) {
        let i = 0;
        req.body.party.forEach(async (e) => {
            if (req.body.party[i] == "" || req.body.rate[i] == "" || req.body.maxReserveRate[i] == "" || req.body.threshold[i] == "") {
                console.log("3");
                await req.flash("info", "There was an error processing your request.");
                return res.redirect(`/ais/inventory/${req.params.id}/edit`);
            };
            recipient = {
                party: e,
                rate: req.body.rate[i] / 100,
                maxReserveRate: req.body.maxReserveRate[i] / 100,
                threshold: req.body.threshold[i],
                createdAt: date,
            };
            royalties.push(recipient);
            i++;
        });
    } else {
        recipient = {
            party: req.body.party,
            rate: req.body.rate / 100,
            maxReserveRate: req.body.maxReserveRate / 100,
            threshold: req.body.threshold,
            createdAt: date,
        };
        royalties.push(recipient);
    };
    if (req.body.party == "") {
        royalties = [];
    };
    // Define Main Object
    const item = {
        name: req.body.name,
        version: req.body.version,
        type: req.body.type,
        pricing: {
            rate: req.body.pricingRate,
            uom: req.body.uom,
        },
        royalties: royalties,
        createdBy: req.user.id,
        updatedBy: req.user.id,
    };
    // Save to db
    try {
        await Item.findOneAndUpdate({number: req.params.id}, item);
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/inventory/${req.params.id}`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory/${req.params.id}/edit`);
    }
};
// Post Delete Item
exports.postDeleteInventory = async (req, res) => {
    try {
        await Item.findOneAndDelete({number: req.params.id});
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect(`/ais/inventory`);
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/inventory`);
    }
};