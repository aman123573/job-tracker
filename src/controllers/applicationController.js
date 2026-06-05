const pool = require('../config/db');
const redis = require('../config/redis');

const CACHE_KEY = (userId) => `applications:${userId}`;

const getAllApplications = async (req, res) => {
    const userId = req.user.id;

    try {
        const cached = await redis.get(CACHE_KEY(userId));
        if (cached) {
            return res.json({ source: 'cache', data: JSON.parse(cached) });
        }

        const result = await pool.query(
            'SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        await redis.set(CACHE_KEY(userId), JSON.stringify(result.rows), 'EX', 60);

        res.json({ source: 'db', data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getApplicationById = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const createApplication = async (req, res) => {
    const userId = req.user.id;
    const { company, role, status, notes, applied_at } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO applications (user_id, company, role, status, notes, applied_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, company, role, status || 'applied', notes, applied_at]
        );

        const newApp = result.rows[0];

        await pool.query(
            'INSERT INTO status_history (application_id, old_status, new_status) VALUES ($1, $2, $3)',
            [newApp.id, null, newApp.status]
        );

        await redis.del(CACHE_KEY(userId));

        res.status(201).json({ message: 'Application added', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateApplication = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { company, role, status, notes, applied_at } = req.body;

    try {
        // fetch BEFORE update
        const current = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (current.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const oldStatus = current.rows[0].status;

        const result = await pool.query(
            `UPDATE applications 
       SET company = COALESCE($1, company),
           role = COALESCE($2, role),
           status = COALESCE($3, status),
           notes = COALESCE($4, notes),
           applied_at = COALESCE($5, applied_at)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
            [company, role, status, notes, applied_at, id, userId]
        );

        if (status && status !== oldStatus) {
            await pool.query(
                'INSERT INTO status_history (application_id, old_status, new_status) VALUES ($1, $2, $3)',
                [id, oldStatus, status]
            );
        }

        await redis.del(CACHE_KEY(userId));

        res.json({ message: 'Application updated', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteApplication = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await redis.del(CACHE_KEY(userId));

        res.json({ message: 'Application deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getStatusHistory = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const app = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (app.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const history = await pool.query(
            'SELECT * FROM status_history WHERE application_id = $1 ORDER BY changed_at ASC',
            [id]
        );

        res.json({ application_id: id, history: history.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    getStatusHistory
};