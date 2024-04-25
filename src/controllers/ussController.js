var pjson = require('../../package.json');
const User = require("../models/userModel");
const fs = require('fs');

var countries;
fs.readFile("src/data/countries.json", "utf8", (err, data) => {
    if (err) {
        console.log(err);
    } else {
        countries = JSON.parse(data);
    }
});

exports.getIndex = async (req, res) => {
    const title = "User Self-Service (USS)";
    const messages = await req.flash("info");
    res.render("uss/index", {
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
    res.render("uss/personal/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss",
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
    res.render("uss/contact/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};
exports.getAddEmergencyContact = async (req, res) => {
    const title = "Add Emergency Contact";
    const messages = await req.flash("info");
    res.render("uss/contact/addemergencycontact", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss/contact",
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
        return res.redirect("/uss/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/uss/contact/emergency/${req.params.id}/edit`);
    };
};
exports.getEditEmergencyContact = async (req, res) => {
    const title = "Edit Emergency Contact";
    const messages = await req.flash("info");
    const contact = req.user.emergencyContacts.find(e => e.id === req.params.id);
    res.render("uss/contact/editemergencycontact", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss/contact",
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
        return res.redirect("/uss/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/uss/contact/emergency/${req.params.id}/edit`);
    };
};
exports.postDeleteEmergencyContact = async (req, res) => {
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
            { "_id": req.user.id },
            {
                $pull: {"emergencyContacts": {_id: req.params.id}}
            },
        );
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/uss/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/uss/contact/emergency/${req.params.id}/edit`);
    };
};
exports.getAddAddress = async (req, res) => {
    const title = "Add Address";
    const messages = await req.flash("info");
    res.render("uss/contact/addaddress", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss/contact",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        countries,
    });
}
exports.postAddAddress = async (req, res) => {
    const address = [
        {
            type: req.body.type,
            startDate: req.body.startDate,
            line1: req.body.line1,
            line2: req.body.line2,
            city: req.body.city,
            stateProvince: req.body.state,
            zip: req.body.zip,
            country: req.body.country,
        }
    ];
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {"mailingAddress": address}
            },
        );
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/uss/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/uss/contact/address/add`);
    };
};
exports.getEditAddress = async (req, res) => {
    const title = "Edit Address";
    const messages = await req.flash("info");
    const address = req.user.mailingAddress.find(e => e.id === req.params.id);
    res.render("uss/contact/editaddress", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss/contact",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        address,
        countries,
    });
};
exports.postEditAddress = async (req, res) => {
    const address = [
        {
            type: req.body.type,
            startDate: req.body.startDate,
            line1: req.body.line1,
            line2: req.body.line2,
            city: req.body.city,
            stateProvince: req.body.state,
            zip: req.body.zip,
            country: req.body.country,
        }
    ];
    try {
        await User.findOneAndUpdate(
            { "_id": req.user.id, "mailingAddress._id": req.params.id },
            {
                $set: {"mailingAddress.$": address}
            },
        );
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/uss/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/uss/contact/address/${req.params.id}/edit`);
    };
};
exports.postDeleteAddress = async (req, res) => {
    const address = [
        {
            type: req.body.type,
            startDate: req.body.startDate,
            line1: req.body.line1,
            line2: req.body.line2,
            city: req.body.city,
            stateProvince: req.body.state,
            zip: req.body.zip,
            country: req.body.country,
        }
    ];
    try {
        await User.findOneAndUpdate(
            { "_id": req.user.id },
            {
                $pull: {"mailingAddress": {_id: req.params.id}}
            },
        );
        await req.flash("info", "Your request has been successfully processed.");
        return res.redirect("/uss/contact");
    } catch (err) {
        console.log(err);
        await req.flash("info", "There was an error processing your request.");
        return res.redirect(`/uss/contact/address/${req.params.id}/edit`);
    };
};

exports.getEmployment = async (req, res) => {
    const title = "Employment Details";
    const messages = await req.flash("info");
    res.render("uss/employment/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/uss",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
}