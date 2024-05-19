var pjson = require('../../../package.json');

exports.getIndex = async (req, res) => {
    const title = "System Configuration";
    const messages = await req.flash("info");
    res.render("config", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/dashboard",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
    });
};