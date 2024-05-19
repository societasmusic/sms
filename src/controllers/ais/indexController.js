var pjson = require('../../../package.json');
const fs = require('fs');
// const Party = require("../../models/partyModel");
// const Account = require("../../models/accountModel");
// const User = require("../../models/userModel");
// const Item = require("../../models/itemModel");
// const Entry = require("../../models/entryModel");
// const crypto = require("crypto");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
// const {downloadCsvResource} = require("../../utils/json-csv");
// const {downloadXmlResource} = require("../../utils/json-xml");

/*
    Initialization
*/
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