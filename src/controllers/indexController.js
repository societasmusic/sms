var pjson = require('../../package.json');

exports.getIndex = async (req, res) => {
    res.redirect("/dashboard");
}

exports.getDash = async (req, res) => {
    res.render("index", {
        user: req.user,
        pjson,
    });
}