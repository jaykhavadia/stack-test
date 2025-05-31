const Job = require('../models/Job');

const createJob = async (req, res, next) => {
  try {
    const { title, company, location, type, salary, description, requirements, category } = req.body;

    const job = new Job({
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      category,
      employer: req.user._id,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const jobs = await Job.find(query).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      res.json(job);
    } else {
      res.status(404);
      throw new Error('Job not found');
    }
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this job');
    }

    const { title, company, location, type, salary, description, requirements, category } = req.body;

    job.title = title || job.title;
    job.company = company || job.company;
    job.location = location || job.location;
    job.type = type || job.type;
    job.salary = salary || job.salary;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.category = category || job.category;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this job');
    }

    await job.remove();
    res.json({ message: 'Job removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
