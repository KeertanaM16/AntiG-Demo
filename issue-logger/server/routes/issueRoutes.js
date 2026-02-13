const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { verifyToken } = require('../middleware/auth');

// Public route - anyone can view issues
router.get('/issues', issueController.getIssues);

// Protected routes - require authentication
router.post('/issues', verifyToken, issueController.createIssue);
router.put('/issues/:id', verifyToken, issueController.updateIssue);
router.delete('/issues/:id', verifyToken, issueController.deleteIssue);

module.exports = router;
