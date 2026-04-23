const express = require('express');
const {
  listOptions,
  startInterview,
  submitAnswer,
  getSummary,
} = require('../controllers/interviewController');

const router = express.Router();

router.get('/options', listOptions);
router.post('/start', startInterview);
router.post('/answer', submitAnswer);
router.get('/summary', getSummary);
router.get('/summary/:sessionId', getSummary);

module.exports = router;
