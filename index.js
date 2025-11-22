const express = require('express');
const path = require('path');

// Import utility modules for each CRUD operation
const CreateStudentUtil = require('./utils/DaniellaUtil');
const ViewRankingsUtil = require('./utils/DylanUtil');
const UpdateStudentUtil = require('./utils/GengyueUtil');
const DeleteAccountUtil = require('./utils/DanishUtil');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ===== Daniella - CREATE API Endpoints =====
app.post('/api/students', CreateStudentUtil.createStudent);

// ===== Dylan - READ API Endpoints =====
app.get('/api/rankings', ViewRankingsUtil.getRankings);

// ===== Gengyue - UPDATE API Endpoints =====
app.post('/api/login', UpdateStudentUtil.loginStudent);
app.get('/api/students/:id', UpdateStudentUtil.getStudentById);
app.put('/api/students/:id', UpdateStudentUtil.updateScores);

// ===== Danish- DELETE API Endpoints =====
app.delete('/api/students/:id', DeleteAccountUtil.deleteStudent);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Chess Club Ranking System running on http://localhost:${PORT}`);
    console.log(`Server started at ${new Date().toLocaleString()}`);
});