var pjson = require('../../../package.json');
const Party = require("../../models/partyModel");
const Account = require("../../models/accountModel");
const User = require("../../models/userModel");
const {downloadCsvResource} = require("../../utils/json-csv");
const fs = require('fs');
const internal = require('stream');

let countries;
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
let currencies;
fs.readFile("src/data/currencies.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        currencies = JSON.parse(data);
    }
});

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
    if (!businesscategories.includes(req.body.category)) {
        console.log("5");
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/ais/parties/create`);
    };
    let internalId;
    const parties = await Party.find();
    if (parties < 1) {
        internalId = 100000 + 1;
    } else {
        const partiesSorted = [];
        parties.forEach(e => {
            partiesSorted.push(e.internalId);
        });
        internalId = Number(Math.max(...partiesSorted) + 1);
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
        externalId: req.body.externalId,
        internalId: Number(internalId),
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
        const party = await Party.findOne({internalId: req.params.id});
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
        const party = await Party.findOne({internalId: req.params.id});
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
        externalId: req.body.externalId,
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
        await Party.findOneAndUpdate({internalId: req.params.id}, party);
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
        await Party.findOneAndDelete({internalId: req.params.id});
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