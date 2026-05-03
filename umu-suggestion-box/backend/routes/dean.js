const express = require('express');
const {
  getAllSuggestionsForDean,
  getSuggestionsByStatusForDean,
  respondToSuggestionAsDean,
  deleteSuggestionByDean,
} = require('../controllers/suggestionController');
const { deanAuth } = require('../middleware/auth');

const router = express.Router();

// Dean can see all suggestions
router.get('/suggestions', deanAuth, getAllSuggestionsForDean);

// Dean can see suggestions by status
router.get('/suggestions/status/:status', deanAuth, getSuggestionsByStatusForDean);

// Dean can respond to any suggestion
router.put('/suggestions/:suggestionId/respond', deanAuth, respondToSuggestionAsDean);

// Dean can delete a suggestion and notify the submitter
router.delete('/suggestions/:suggestionId/delete', deanAuth, deleteSuggestionByDean);

module.exports = router;