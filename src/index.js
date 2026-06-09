const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Job Tracker API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});