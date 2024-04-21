var pjson = require('../../package.json');

exports.getIndex = async (req, res) => {
    res.redirect("/dashboard");
}

exports.getDash = async (req, res) => {
    const title = "Dashboard"
    res.render("index", {
        user: req.user,
        urlraw: req.url,
        url: encodeURIComponent(req.url),
        title,
        pjson,
    });
};