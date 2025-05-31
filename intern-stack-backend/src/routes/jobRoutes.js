const express = require('express');
const { body } = require('express-validator');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', getJobs);

router.get('/:id', getJobById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['employer']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('salary').notEmpty().withMessage('Salary is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  createJob
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['employer']),
  [
    body('title').optional().notEmpty().withMessage('Title is required'),
    body('company').optional().notEmpty().withMessage('Company is required'),
    body('location').optional().notEmpty().withMessage('Location is required'),
    body('type').optional().notEmpty().withMessage('Type is required'),
    body('salary').optional().notEmpty().withMessage('Salary is required'),
    body('description').optional().notEmpty().withMessage('Description is required'),
    body('requirements').optional().isArray({ min: 1 }).withMessage('At least one requirement is required'),
    body('category').optional().notEmpty().withMessage('Category is required'),
  ],
  updateJob
);

router.delete('/:id', authMiddleware, roleMiddleware(['employer']), deleteJob);

module.exports = router;
