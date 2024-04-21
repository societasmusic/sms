const User = require("../models/userModel");

exports.getBookmark = async (req, res) => {
    const bookmark = {
        title: req.query.title,
        url: req.query.url,
    };
    const bookmarks = req.user.bookmark;
    try {
        for (let i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i].url === bookmark.url) {
                await User.findByIdAndUpdate(
                    req.user.id,
                    {
                        $pull: {"bookmark": bookmark}
                    },
                );
                console.log("Bookmark removed");
                return res.redirect(`${bookmark.url}`);
            };
        };
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {"bookmark": bookmark}
            },
        );
        console.log("Bookmark created");
        return res.redirect(`${bookmark.url}`);
    } catch (err) {
        return res.redirect(`${bookmark.url}`);
    }
};