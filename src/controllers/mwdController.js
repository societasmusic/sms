var pjson = require('../../package.json');
const fs = require("fs");
const Advance = require("../models/advanceModel");

exports.getIndex = async (req, res) => {
    const title = "My Work Day";
    const messages = await req.flash("info");
    res.render("mwd/index", {
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
    Expenses & Travel
*/
exports.getExpensesIndex = async (req, res) => {
    const advances = await Advance.find({}).limit(999);
    const title = "Expenses and Travel";
    const messages = await req.flash("info");
    res.render("mwd/expenses/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/mwd",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        advances,
    });
};
var expensetypes;
fs.readFile("src/data/expensetypes.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        expensetypes = JSON.parse(data);
    }
});
exports.getExpensesCreate = async (req, res) => {
    const title = "Create Expense Report";
    const messages = await req.flash("info");
    res.render("mwd/expenses/create", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/mwd/expenses",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        expensetypes,
        messages,
    });
};
exports.postExpensesCreate = async (req, res) => {
    console.log(req.body);
};
exports.getAdvanceRequest = async (req, res) => {
    const title = "Request Cash Advance";
    const messages = await req.flash("info");
    res.render("mwd/expenses/request", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/mwd/expenses",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        expensetypes,
        messages,
    });
};
exports.postAdvanceRequest = async (req, res) => {
    const attachments = req.body.attachments
    const request = new Advance({
        requestor: req.user.id,
        createdBy: req.user.id,
        updatedBy: req.user.id,
        purpose: req.body.purpose,
        amount: req.body.amount,
        type: req.body.type,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        attachment: [
            attachments
        ],
        status: "Draft",
    });
    try {
        await request.save();
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/mwd/expenses");
    } catch (err) {
        console.log(err);
        // Write Error Notification
        await req.flash("info", "There was an error processing your request.");
        return res.redirect("/mwd/expenses/advances/request");
    }
};
exports.getAdvanceView = async (req, res) => {
    const advance = await Advance.findById({_id: req.params.id});
    const title = "View Cash Advance";
    const messages = await req.flash("info");
    res.render("mwd/expenses/viewadvance", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/mwd/expenses",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        expensetypes,
        messages,
        advance,
    });
};