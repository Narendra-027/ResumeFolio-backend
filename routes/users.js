const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");

const async = require('async');

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
    });
});

router.post("/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found",
            });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({ 
                    loginSuccess: false, 
                    message: "Wrong password" 
                });
            }

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // Enhanced cookie settings for security and cross-origin compatibility
                res.cookie("w_auth", user.token, {
                    httpOnly: true, // Prevent access from client-side JS
                    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
                    sameSite: 'None', // Prevent CSRF attacks
                    maxAge: 60 * 60 * 1000, // 1 hour expiration
                });

                res.cookie("w_authExp", user.tokenExp, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'None',
                });

                res.status(200).json({
                    loginSuccess: true,
                    userId: user._id,
                });
            });
        });
    });
});

// router.post("/login", (req, res) => {
//     User.findOne({ email: req.body.email }, (err, user) => {
//         if (!user)
//             return res.json({
//                 loginSuccess: false,
//                 message: "Auth failed, email not found"
//             });

//         user.comparePassword(req.body.password, (err, isMatch) => {
//             if (!isMatch)
//                 return res.json({ loginSuccess: false, message: "Wrong password" });

//             user.generateToken((err, user) => {
//                 if (err) return res.status(400).send(err);
//                 res.cookie("w_authExp", user.tokenExp);
//                 res
//                     .cookie("w_auth", user.token)
//                     .status(200)
//                     .json({
//                         loginSuccess: true, userId: user._id
//                     });
//             });
//         });
//     });
// });

router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});


router.post("/addResume", auth, (req, res) => {
    console.log("reaBody",req.body)
    User.findOneAndUpdate(
        { _id: req.body.userId },
        {
            $push: {
                resumes: {
                    id: req.body.resumeId,
                    date: Date.now(),
                    title : "untitled"
                }
            }
        },
        { new: true },
        (err, userInfo) => {
            if (err) return res.json({ success: false, err });
            res.status(200).json({success: true, resumes:userInfo.resumes})
        }
    )
});

router.get("/getResumeList", (req, res) =>{
    User.findOne({_id: req.query.userId},(err, user)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({resumes: user.resumes, success: true});
    })
})

module.exports = router;