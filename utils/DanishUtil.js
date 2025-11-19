const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'students.json');

/**
 * Danish - DELETE Feature
 * Handles student account deletion (leaving the club)
 */

// Delete student account
const deleteStudent = async (req, res) => {
    // Uncomment the following line to test error handling
    // throw new Error('Test error');
    try {
        const { id } = req.params;

        // Validation 1: Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required for deletion.'
            });
        }

        const data = await fs.readFile(DB_PATH, 'utf8');
        const students = JSON.parse(data);

        // Error case 1: Student ID not found
        const studentIndex = students.students.findIndex(s => s.id === id);
        if (studentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student ID not found. Cannot delete account.'
            });
        }

        // Store student data before deletion for confirmation
        const deletedStudent = students.students[studentIndex];

        // Remove student from array
        students.students.splice(studentIndex, 1);

        // Write back to file
        await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));

        res.json({
            success: true,
            message: 'Account deleted successfully. You have left the Chess Club.',
            deletedStudent: {
                id: deletedStudent.id,
                rapid: deletedStudent.rapid,
                blitz: deletedStudent.blitz,
                bullet: deletedStudent.bullet
            },
            remainingStudents: students.students.length
        });

    } catch (error) {
        console.error('Error deleting student:', error);

        // Error case 2: Deletion failed
        if (error.code === 'ENOENT') {
            return res.status(500).json({
                success: false,
                message: 'Database file not found. Cannot delete account.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete account. Please try again.',
            error: error.message
        });
    }
};

module.exports = {
    deleteStudent
};
