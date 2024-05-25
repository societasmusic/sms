var pjson = require('../../../package.json');
const Account = require("../../models/accountModel");
const User = require("../../models/userModel");
const Entry = require("../../models/entryModel");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const {downloadCsvResource} = require("../../utils/json-csv");

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
        const entry = await Entry.findOne({number: req.params.id});
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
        const entry = await Entry.findOne({number: req.params.id});
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
            urlreturn: `/ais/entries/${req.params.id}`,
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
            const existingEntry = await Entry.findOne({number: req.params.id});
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
        await Entry.findOneAndUpdate({number: req.params.id}, entry);
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
        await Entry.findOneAndDelete({number: req.params.id});
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