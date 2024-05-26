var pjson = require('../../../package.json');
const Party = require("../../models/partyModel");
const Account = require("../../models/accountModel");
const User = require("../../models/userModel");
const Item = require("../../models/itemModel");
const fs = require('fs');

/*
    Initialization
*/
var itemTypes;
fs.readFile("src/data/itemTypes.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        itemTypes = JSON.parse(data);
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
        externalId: req.body.externalId,
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
        externalId: req.body.externalId,
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