const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');

dotenv.config();

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$ML6yeVRShdjRxaMTHapRke.dqZ76AQONBxQPGlDyr9k2OxL2sOSeG', // password123
    role: 'jobseeker',
  },
  {
    name: 'Jane Smith',
    email: 'jane@techcorp.com',
    password: '$2a$10$ML6yeVRShdjRxaMTHapRke.dqZ76AQONBxQPGlDyr9k2OxL2sOSeG', // password123
    role: 'employer',
    company: 'TechCorp Inc.',
  },
];

const jobs = [
  {
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a senior React developer to join our team...',
    requirements: [
      '5+ years of React experience',
      'TypeScript proficiency',
      'Experience with state management',
    ],
    category: 'Development',
  },
  {
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    description: 'Join our creative team as a UI/UX Designer...',
    requirements: [
      '3+ years of design experience',
      'Proficiency in Figma',
      'Strong portfolio',
    ],
    category: 'Design',
  },
  {
    title: 'Marketing Manager',
    company: 'GrowthCo',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    description: 'Lead our marketing initiatives...',
    requirements: [
      '5+ years of marketing experience',
      'Experience with digital marketing',
      'Strong analytical skills',
    ],
    category: 'Marketing',
  },
];

const applications = [
  {
    status: 'pending',
    coverLetter: 'I am excited to apply for this position...',
    resume: 'https://example.com/resume.pdf',
  },
  {
    status: 'accepted',
    coverLetter: 'I believe I would be a great fit...',
    resume: 'https://example.com/resume.pdf',
  },
  {
    status: 'rejected',
    coverLetter: 'I am interested in this opportunity...',
    resume: 'https://example.com/resume.pdf',
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();

    // Insert users with hashed passwords
    const createdUsers = [];
    for (const user of users) {
      const newUser = new User(user);
      await newUser.save();
      createdUsers.push(newUser);
    }

    // Insert jobs with employer reference
    const createdJobs = [];
    for (const job of jobs) {
      // Find employer user by company name
      const employer = createdUsers.find(
        (u) => u.role === 'employer' && u.company === job.company
      );
      if (!employer) continue;
      const newJob = new Job({
        ...job,
        employer: employer._id,
      });
      await newJob.save();
      createdJobs.push(newJob);
    }

    // Insert applications linking job seeker and jobs
    const jobSeeker = createdUsers.find((u) => u.role === 'jobseeker');
    for (let i = 0; i < applications.length; i++) {
      if (i >= createdJobs.length) break;
      const newApp = new Application({
        job: createdJobs[i]._id,
        user: jobSeeker._id,
        status: applications[i].status,
        coverLetter: applications[i].coverLetter,
        resume: applications[i].resume,
      });
      await newApp.save();
    }

    console.log('Sample data imported!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
