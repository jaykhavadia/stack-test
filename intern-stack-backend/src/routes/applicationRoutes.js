const express = require('express');
const { body } = require('express-validator');
const {
  applyForJob,
  getApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getApplications);

router.post(
  '/',
  roleMiddleware(['jobseeker']),
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('coverLetter').optional().isString(),
    body('resume').optional().isString(),
  ],
  applyForJob
);

router.put(
  '/:id',
  roleMiddleware(['employer']),
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['pending', 'accepted', 'rejected'])
      .withMessage('Invalid status value'),
  ],
  updateApplicationStatus
);

module.exports = router;
