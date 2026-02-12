const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

router.post('/issues', issueController.createIssue);
router.get('/issues', issueController.getIssues);

module.exports = router;
