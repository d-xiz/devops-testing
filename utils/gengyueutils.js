const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'students.json');

/**
 * Gengyue - UPDATE Feature
 * Gengyue - Handles student login and score updates
 */

// Simple login - verify student ID exists
const loginStudent = async (req, res) => {
    try {
        const { id } = req.body;

        // Validation 1: Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required.'
            });
        }

        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        // Error case 1: Student ID not found
        const student = students.students.find(s => s.id === id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student ID not found. Please check your ID and try again.'
            });
        }

        // Success - return student data
        res.json({
            success: true,
            message: 'Login successful!',
            student: student
        });

    } catch (error) {
        console.error('Error during login:', error);

        // Error case 2: Database read error
        res.status(500).json({
            success: false,
            message: 'Failed to login. Please try again.',
            error: error.message
        });
    }
};

// Get student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        const student = students.students.find(s => s.id === id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        res.json({
            success: true,
            student: student
        });

    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve student data',
            error: error.message
        });
    }
};

// Update student scores
const updateScores = async (req, res) => {
    try {
        const { id } = req.params;
        const { rapid, blitz, bullet } = req.body;

        // Validation 1: Check if all scores are provided
        if (rapid === undefined || blitz === undefined || bullet === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All rating fields (Rapid, Blitz, Bullet) are required.'
            });
        }

        // Validation 2: Check score ranges (0-3000)
        const rapidNum = parseInt(rapid);
        const blitzNum = parseInt(blitz);
        const bulletNum = parseInt(bullet);

        if (rapidNum < 0 || rapidNum > 3000 ||
            blitzNum < 0 || blitzNum > 3000 ||
            bulletNum < 0 || bulletNum > 3000) {
            return res.status(400).json({
                success: false,
                message: 'Invalid scores. All ratings must be between 0 and 3000.'
            });
        }

        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        // Error case 1: Student ID not found
        const studentIndex = students.students.findIndex(s => s.id === id);
        if (studentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student ID not found. Cannot update scores.'
            });
        }

        // Store old scores for reference
        const oldScores = {
            rapid: students.students[studentIndex].rapid,
            blitz: students.students[studentIndex].blitz,
            bullet: students.students[studentIndex].bullet
        };

        // Update scores
        students.students[studentIndex].rapid = rapidNum;
        students.students[studentIndex].blitz = blitzNum;
        students.students[studentIndex].bullet = bulletNum;
        students.students[studentIndex].updatedAt = new Date().toISOString();

        // Write back to file
        await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));

        res.json({
            success: true,
            message: 'Scores updated successfully!',
            student: students.students[studentIndex],
            changes: {
                rapid: { old: oldScores.rapid, new: rapidNum },
                blitz: { old: oldScores.blitz, new: blitzNum },
                bullet: { old: oldScores.bullet, new: bulletNum }
            }
        });

    } catch (error) {
        console.error('Error updating scores:', error);

        // Error case 2: Update failed
        res.status(500).json({
            success: false,
            message: 'Failed to update scores. Please try again.',
            error: error.message
        });
    }
};

module.exports = {
    loginStudent,
    getStudentById,
    updateScores
};
