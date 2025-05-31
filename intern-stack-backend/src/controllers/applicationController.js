const Application = require('../models/Application');
const Job = require('../models/Job');

const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resume } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      user: req.user._id,
    });

    if (existingApplication) {
      res.status(400);
      throw new Error('You have already applied for this job');
    }

    const application = new Application({
      job: jobId,
      user: req.user._id,
      coverLetter,
      resume,
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    let applications;

    if (req.user.role === 'employer') {
      // Get jobs posted by employer
      const jobs = await Job.find({ employer: req.user._id });
      const jobIds = jobs.map((job) => job._id);

      applications = await Application.find({ job: { $in: jobIds } })
        .populate('job')
        .populate('user', '-password');
    } else {
      // Job seeker: get own applications
      applications = await Application.find({ user: req.user._id })
        .populate('job')
        .populate('user', '-password');
    }

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this application');
    }

    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    application.status = status;
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getApplications,
  updateApplicationStatus,
};
