const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resumeSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        default: "untitled",
        maxlength: 100
    },
    views: {
        type: Number,
        default: 0
    },
    date:{
        type: Date,
    },
    isPublic:{
        type: Boolean,
        default: false
    },
    resume: {
        type: Object
    },
    education: {
        type: [String]
    },
    experience: {
        type: [String]
    },
    projects: {
        type: [String]
    },
    skills: {
        type: [String]
    },
    courses: {
        type: [String]
    }
}, { timestamps: true })


resumeSchema.index({ 
    resume: 'text',
}, {
    weights: {
        resume: 1,
    }
})

resumeSchema.index({ 
    education: 'text',
}, {
    weights: {
        education: 1,
    }
})

resumeSchema.index({ 
    experience: 'text',
}, {
    weights: {
        experience: 1,
    }
})

resumeSchema.index({ 
    projects: 'text',
}, {
    weights: {
        projects: 1,
    }
})

resumeSchema.index({ 
    skills: 'text',
}, {
    weights: {
        skills: 1,
    }
})

resumeSchema.index({ 
    courses: 'text',
}, {
    weights: {
        courses: 1,
    }
})

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = { Resume }