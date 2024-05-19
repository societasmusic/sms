var pjson = require('../../../package.json');
const Account = require("../../models/accountModel");
const User = require("../../models/userModel");
const Entry = require("../../models/entryModel");
const {downloadCsvResource} = require("../../utils/json-csv");

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