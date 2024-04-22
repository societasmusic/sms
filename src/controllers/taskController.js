var pjson = require('../../package.json');
const Task = require("../models/taskModel.js")

exports.getIndex = async (req, res) => {
    let perPage = req.query.l || 10;
    let page = req.query.p || 1;
    const allTasks = await Task.find();
    const count = allTasks.length;
    const tasks = await Task.aggregate([{ $sort: { legalname: 1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const title = "Task Manager";
    const messages = await req.flash("info");
    res.render("tasks/index", {
        user: req.user,
        urlraw: req.url,
        urlreturn: "/dashboard",
        url: encodeURIComponent(req.url),
        title,
        pjson,
        messages,
        tasks,
        current: page,
        perPage,
        count,
        pages: Math.ceil(count / perPage),
    });
};