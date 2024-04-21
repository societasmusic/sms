var pjson = require('../../package.json');
const User = require("../models/userModel");

exports.getIndex = async (req, res) => {
    const title = "Profile Index";
    res.render("profile/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/dashboard",
        url: encodeURIComponent(req.url),
        title,
        pjson,
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
    res.render("profile/personaldetails/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/profile",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        createdByUser,
        updatedByUser,
    });
};