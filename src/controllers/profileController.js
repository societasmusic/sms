var pjson = require('../../package.json');
const User = require("../models/userModel");
const mongoose = require("mongoose");

exports.getIndex = async (req, res) => {
    const title = "Profile Index";
    const messages = await req.flash("info");
    res.render("profile/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/dashboard",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};

exports.getPersonal = async (req, res) => {
    var createdByUser;
    try {
        createdByUser = await User.findById(req.user.createdBy);
        createdByUser = `${createdByUser.fname} ${createdByUser.lname}`;
    } catch (err) {
        createdByUser = "System";
    }
    var updatedByUser;
    try {
        updatedByUser = await User.findById(req.user.updatedBy);
        updatedByUser = `${updatedByUser.fname} ${updatedByUser.lname}`;
    } catch (err) {
        updatedByUser = "System";
    }
    const title = "Personal Details";
    const messages = await req.flash("info");
    res.render("profile/personaldetails/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/profile",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        createdByUser,
        updatedByUser,
        messages,
    });
};
exports.getContact = async (req, res) => {
    const title = "Contact Information";
    const messages = await req.flash("info");
    res.render("profile/contact/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/profile",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};
exports.getAddEmergencyContact = async (req, res) => {
    const title = "Add Emergency Contact";
    const messages = await req.flash("info");
    res.render("profile/contact/addemergencycontact", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/profile/contact",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};
exports.postAddEmergencyContact = async (req, res) => {
    const contact = [
        {
            name: req.body.name,
            relation: req.body.relation,
            email: req.body.email,
            phone: req.body.phone,
        }
    ];
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {"emergencyContacts": contact}
            },
        );
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/profile/contact");
    } catch (err) {

    };
};
exports.getEditEmergencyContact = async (req, res) => {
    const title = "Edit Emergency Contact";
    const messages = await req.flash("info");
    const contact = req.user.emergencyContacts.find(e => e.id === req.params.id);
    res.render("profile/contact/editemergencycontact", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/profile/contact",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        contact,
    });
};
exports.postEditEmergencyContact = async (req, res) => {
    const contact = [
        {
            name: req.body.name,
            relation: req.body.relation,
            email: req.body.email,
            phone: req.body.phone,
        }
    ];
    try {
        await User.findOneAndUpdate(
            { "_id": req.user.id, "emergencyContacts._id": req.params.id },
            {
                $set: {"emergencyContacts.$": contact}
            },
        );
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/profile/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/profile/contact/emergency/${req.params.id}/edit`);
    };
};