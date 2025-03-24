const express = require('express');
const router = express.Router();
const { Resume } = require("../models/Resume");
const { User } = require("../models/User");

//const { auth } = require("../middleware/auth");


router.post("/uploadResume",(req, res) =>{
    const resumeBody = req.body.resume;

    const eduSchool = resumeBody.Education.details.map(detail => detail.college);
    const eduDegree = resumeBody.Education.details.map(detail => detail.title);
    const education = eduSchool.concat(eduDegree);

    const expPoints = resumeBody.Experience.details.flatMap(detail => detail.points);
    const expCompany = resumeBody.Experience.details.map(detail => detail.companyName);
    const workExp = expPoints.concat(expCompany);

    const projectPoints = resumeBody.Projects.details.flatMap(detail => detail.points);
    const projectSkills = resumeBody.Projects.details.map(detail => detail.overview);
    const projects = projectPoints.concat(projectSkills);

    const skills = resumeBody.Skills.details.flatMap(detail => detail.points);
    const courses = resumeBody.Coursework.points;

    const resume_ = new Resume();
    resume_.education = education;
    resume_.resume = resumeBody;
    resume_.experience = workExp;
    resume_.projects = projects;
    resume_.skills = skills;
    resume_.courses = courses;
    resume_.title = "untitled";
    resume_.date = Date.now();

    resume_.save((err) =>{
        if(err){
            return res.status(400).json({success: false, err});
        }else{
            return res.status(200).json({success : true, id: resume_._id});
        }
    })
});

router.get("/resume_by_id", (req, res) => {
    let type = req.query.type
    let resumeIds = req.query.id

    if (type === "array") {
        let ids = req.query.id.split(',');
        resumeIds = [];
        resumeIds = ids.map(item => {
            return item
        })
    }
    //we need to find the product information that belong to product Id 
    Resume.find({ '_id': { $in: resumeIds } })
        .populate('writer')
        .exec((err, resume) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send(resume);
        })
});

router.post("/updateResume", (req, res)=>{
    const resumeBody = req.body.resume;

    const eduSchool = resumeBody.Education.details.map(detail => detail.college);
    const eduDegree = resumeBody.Education.details.map(detail => detail.title);
    const education = eduSchool.concat(eduDegree);

    const expPoints = resumeBody.Experience.details.flatMap(detail => detail.points);
    const expCompany = resumeBody.Experience.details.map(detail => detail.companyName);
    const workExp = expPoints.concat(expCompany);

    const projectPoints = resumeBody.Projects.details.flatMap(detail => detail.points);
    const projectSkills = resumeBody.Projects.details.map(detail => detail.overview);
    const projects = projectPoints.concat(projectSkills);

    const skills = resumeBody.Skills.details.flatMap(detail => detail.points);
    const courses = resumeBody.Coursework.points;

    const updatedResume = {
        'resume': resumeBody,
        'projects': projects,
        'experience': workExp,
        'education': education,
        'skills': skills,
        'courses': courses,
        'title': req.body.title,
        'date': Date.now()
    }
    Resume.findOneAndUpdate(
        { _id: req.body.resumeId },
        { $set: updatedResume },
        { new: true },
        (err, updatedResume)=>{
            if(err) return res.json({ success: false, err });
            User.findOneAndUpdate(
                { _id: req.body.userId, "resumes.id": req.body.resumeId },
                { $set: {"resumes.$.title": req.body.title}},
                { new: true},
                (err, response)=>{
                    if(err) return res.json({ success: false, err });
                    res.status(200).json({success: true});
                }
            )
        }
    )
})


router.post("/getProducts", (req, res) => {

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm;

    for (let key in req.body.filters) {

        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    console.log("findArgs",findArgs)

    if (term) {
    const regex = new RegExp(term, "i"); // "i" flag makes the search case-insensitive

    // Use the regular expression in the query to match partial text
        findArgs = { ...findArgs, products: regex };
        Product.find(findArgs)
            .find({ $text: { $search: term } })
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    }
});


module.exports = router;
