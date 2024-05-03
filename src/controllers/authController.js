const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const nodemailer = require("nodemailer");

// Nodemailer Init
const transporter = nodemailer.createTransport({
    host: "smtp.migadu.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.INFORMATION_EMAIL_USERNAME,
        pass: process.env.INFORMATION_EMAIL_PASSWORD,
    },
});
const sendMail = async (transporter, info1) => {
    try {
        await transporter.sendMail(info1);
    } catch (err) {
        console.log(err);
    }
};

/*
    Get Login Page
*/
exports.getLogin = async (req, res) => {
    locals = {
        title: "Login | SMS"
    };
    const messages = await req.flash("info");
    res.render("auth/login", {
        locals,
        messages,
    });
};

/*
    Get Reset (Send Link) Page
*/
exports.getReset = async (req, res) => {
    locals = {
        title: "Reset Password | SMS"
    };
    const messages = await req.flash("info");
    res.render("auth/reset", {
        locals,
        messages,
    });
};

/*
    Login Post Function
*/
exports.postLogin = async (req, res) => {
    try {
        // Check if email matches existing record
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            await req.flash("info", "Invalid login details.");
            return res.redirect("/auth/login");
        }
        // Check if user's account is active 
        if (user.status != "Enabled") {
            await req.flash("info", "This account is disabled.");
            return res.redirect("/auth/login");
        }
        // Check if password is correct
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) {
            await req.flash("info", "Invalid login details.");
            return res.redirect("/auth/login");
        } else {
            // Create login token
            const token = await jwt.sign({
                _id: user._id
            }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES
            });
            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 60 * 1000
                ),
                httpOnly: true
            };
            const lastLoginToken = await promisify(jwt.verify)(
                token, 
                process.env.JWT_SECRET
            );
            const lastLogin = new Date(lastLoginToken.iat * 1000);
            const updatedLastLogin = {
                lastLogin: lastLogin,
            };
            try {
                await User.findByIdAndUpdate(user.id, updatedLastLogin, {timestamps: false});
            } catch (err) {
                console.log(err);
            };
            res.cookie("jwt", token, cookieOptions);
            res.status(200).redirect("/");
        };
    } catch (err) {
        console.log(err);
        await req.flash("info", "Invalid login details.");
        return res.redirect("/auth/login");
    };
};

/*
    Logout Function
*/
exports.logout = async (req, res) => {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/auth/login");
};

/*
    Check if user is logged in
*/
exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            try {
                const decoded = await promisify(jwt.verify)(
                    req.cookies.jwt, 
                    process.env.JWT_SECRET
                    );
                const user = await User.findOne({_id: decoded._id});
                if (!user) {
                    return res.redirect("/auth/login");
                };
                req.user = user;
                return next();
            } catch (err) {
                return res.redirect("/auth/login");
            }
        } else {
            return res.redirect("/auth/login");
        }
    } catch (err) {
        return res.redirect("/auth/login");
    }
};

/*
    User Access Validation
*/
// Check if Owner
exports.isOwner = async (req, res, next) => {
    if (req.user.access == "System Owner") {
        return next();
    } else {
        return res.redirect("/");
    }
};
// Check if Admin
exports.isAdmin = async (req, res, next) => {
    if (req.user.access == "System Administrator" || req.user.access == "System Owner") {
        return next();
    } else {
        return res.redirect("/");
    }
};
// Check if Editor
exports.isEditor = async (req, res, next) => {
    if (req.user.access == "Editor" || req.user.access == "System Administrator" || req.user.access == "System Owner") {
        return next();
    } else {
        return res.redirect("/");
    }
};
// Check if Viewer
exports.isViewer = async (req, res, next) => {
    if (req.user.access == "Viewer" || req.user.access == "Editor" || req.user.access == "System Administrator" || req.user.access == "System Owner") {
        return next();
    } else {
        return res.redirect("/");
    }
};
// AIS Access
// exports.hasAISAccess = async (req, res, next) => {
//     if (req.user.access == "Viewer" || req.user.access == "Editor" || req.user.access == "System Administrator" || req.user.access == "System Owner") {
//         return next();
//     } else {
//         return res.redirect("/");
//     }
// };

/*
    Password reset post function
*/
exports.postReset = async (req, res) => {
    const email = req.body.email;
    try {
        const existingEmail = await User.findOne({email: email});
        if (!existingEmail) {
            await req.flash("info", "This email does not match any existing accounts.");
            return res.redirect("/auth/reset");
        }
        const resetSecret = process.env.JWT_SECRET + existingEmail.password;
        const resetToken = jwt.sign({
            email: existingEmail.email,
            _id: existingEmail._id
        }, resetSecret, {
            expiresIn: "5m"
        });
        const resetLink = `${process.env.LINK_DEPLOYMENT}/auth/reset/new/${existingEmail._id}/${resetToken}`;
        // Send Reset Email
        const date = new Date().toISOString().replaceAll(":", "").replaceAll(".", "").slice(0, 10);
        const infoPasswordReset = {
            from: {
                name: "Societas Music Group",
                address: process.env.INFORMATION_EMAIL_USERNAME,
            },
            to: existingEmail.email,
            subject: `Reset Your Password | User ID: ${existingEmail._id} | ${date}`,
            text: `Use the link below to reset your password. Be advised, this link expires in 5 minutes. ${resetLink}. If you did not request this link, you may simply ignore it. -SMG`,
            html: `
                <table style="font-family:Arial,Helvetica,sans-serif;width:100%">
                    <tr>
                        <td style="background-color:#333fff;padding:48px 64px;text-align: center;">
                            <img src="https://i.imgur.com/v8kPC4r.png" alt="Societas Music Group Logo" height="72px" width="auto">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 64px;">
                            <p>Hi ${existingEmail.fname},</p>
                            <p>You may set a new password using the link below.</p>
                            <p><a href="${resetLink}" target="_blank" style="color:#777fff">Reset Password</a></p>
                            <p>If you did not request this link, you may safely ignore this email. Be advised, this link will expire in five minutes.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#e8e8e8;padding:24px 64px;text-align: center;">
                            <table width="400" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse">
                                <tr>
                                    <td>
                                        <a href="https://www.instagram.com/societasmusic/" target="_blank">
                                            <img width="42" height="42" src="https://img.icons8.com/material-outlined/96/000000/instagram-new--v1.png" alt="instagram-new--v1"/>
                                        </a>
                                    </td>
                                    <td>
                                        <a href="https://twitter.com/societasmusic/" target="_blank">
                                            <img width="42" height="42" src="https://img.icons8.com/material-outlined/96/000000/twitterx--v2.png" alt="twitterx--v2"/>
                                        </a>
                                    </td>
                                    <td>
                                        <a href="https://open.spotify.com/user/31tbzpi4uidgnolun6lckjd3gqvu" target="_blank">
                                            <img width="42" height="42" src="https://img.icons8.com/ios-filled/96/000000/spotify.png" alt="spotify"/>
                                        </a>
                                    </td>
                                    <td>
                                        <a href="https://www.linkedin.com/company/societasmusic/" target="_blank">
                                            <img width="42" height="42" src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" alt="linkedin"/>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <table width="400" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;">
                                <tr style="color:#888888;text-align: center;">
                                    <td style="text-align: center;">
                                        <table align="center" style="text-align: center;">
                                            <tr>
                                                <td style="padding-top:36px;text-align: center;">332 S Michigan Ave Ste 121</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:4px;text-align: center;">Chicago IL 60604</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:4px;text-align: center;">United States of America</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:16px;text-align: center;">Societas Music Group Corporation</td>
                                            </tr>
                                            <table align="center" style="text-align: center;padding-top: 16px;">
                                                <tr>
                                                    <td>
                                                        <a href="mailto:support@societasmusic.com" style="color:#888888;">Contact Us</a>
                                                    </td>
                                                    <td style="padding:0px 8px">|</td>
                                                    <td>
                                                        <a href="https://www.societasmusic.com/privacy-policy" target="_blank" style="color:#888888;">Privacy Policy</a>
                                                    </td>
                                                    <td style="padding:0px 8px">|</td>
                                                    <td>
                                                        <a href="https://www.societasmusic.com/terms-of-service" target="_blank" style="color:#888888;">Terms of Service</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `
        };
        sendMail(transporter, infoPasswordReset);
        await req.flash("info", "Reset link sent to the specified email address.");
        return res.redirect("/auth/login");
    } catch (err) {
        console.log(err);
        return res.redirect("/auth/reset");
    };
};

/*
    Get Reset (Set Password) Page
*/
exports.getResetNew = async (req, res) => {
    const locals = {
        title: "Set New Password | SMS"
    }
    const {_id, resetToken} = req.params;
    const existingEmail = await User.findOne({_id: _id});
    if (!existingEmail) {
        return res.redirect("/auth/login");
    };
    const resetSecret = process.env.JWT_SECRET + existingEmail.password;
    try {
        const verifySecret = jwt.verify(resetToken, resetSecret);
        res.render("auth/resetnew", {
            locals, 
            email: verifySecret.email,
            resetToken,
            _id,
        });
    } catch (err) {
        console.log(err);
        await req.flash("info", "Invalid or expired link.");
        return res.redirect("/auth/login");
    };
};

/*
    Post New Password Function
*/
exports.postResetNew = async (req, res) => {
    const {_id, resetToken} = req.params;
    const {password} = req.body;
    const existingEmail = await User.findOne({_id: _id});
    if (!existingEmail) {
        return res.redirect("/auth/reset");
    };
    const resetSecret = process.env.JWT_SECRET + existingEmail.password;
    try {
        const verifySecret = jwt.verify(resetToken, resetSecret);
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(_id, {
            password: hashedPassword
        });
        await req.flash("info", "Your password has been changed successfully.");
        await res.redirect("/auth/login");
    } catch (err) {
        console.log(err);
        return res.redirect("/auth/reset");
    };
}