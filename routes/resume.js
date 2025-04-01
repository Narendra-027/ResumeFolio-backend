const express = require('express');
const router = express.Router();
const { Resume } = require("../models/Resume");
const { User } = require("../models/User");
const puppeteer = require("puppeteer");
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

router.post("/deleteResume", (req, res) => {
    const resumeId = req.body.resumeId;
    const userId = req.body.userId;

    Resume.findOneAndDelete({ _id: resumeId }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        User.findOneAndUpdate(
            { _id: userId },
            { $pull: { resumes: { id: resumeId } } },
            { new: true },
            (err, userInfo) => {
                if (err) return res.json({ success: false, err });
                return res.status(200).send({
                    success: true,
                });
            }
        );
    });
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
                { $set: {"resumes.$.title": req.body.title, "resumes.$.date": Date.now()} },
                { new: true},
                (err, response)=>{
                    if(err) return res.json({ success: false, err });
                    res.status(200).json({success: true});
                }
            )
        }
    )
})

router.get("/generate-pdf", async (req, res) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
  
      // Load the resume page (Frontend route where resume is displayed)
      await page.goto("http://localhost:3000/body", { waitUntil: "networkidle2" });
  
      // Wait for resume div to load
      await page.waitForSelector("#resume", {visible: true});
  
      // Generate the PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true, // Ensure styles and backgrounds are included
      });
  
      await browser.close();
  
      // Send the PDF as a response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
  });
module.exports = router;
