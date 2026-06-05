const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    getStatusHistory
} = require('../controllers/applicationController');
const rateLimiter = require('../middleware/rateLimiter');

router.get('/', auth, rateLimiter, getAllApplications);
router.get('/:id', auth, rateLimiter, getApplicationById);
router.get('/:id/history', auth, rateLimiter, getStatusHistory);
router.post('/', auth, rateLimiter, createApplication);
router.put('/:id', auth, rateLimiter, updateApplication);
router.delete('/:id', auth, rateLimiter, deleteApplication);

module.exports = router;