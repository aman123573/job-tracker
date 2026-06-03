const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
} = require('../controllers/applicationController');

router.get('/', auth, getAllApplications);
router.get('/:id', auth, getApplicationById);
router.post('/', auth, createApplication);
router.put('/:id', auth, updateApplication);
router.delete('/:id', auth, deleteApplication);

module.exports = router;