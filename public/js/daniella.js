/**
 * Member A - CREATE Feature (Frontend)
 * Handles student account creation UI and interactions
 */

// Handle form submission for creating student
document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('student-id').value.trim();
    const rapid = document.getElementById('rapid-score').value;
    const blitz = document.getElementById('blitz-score').value;
    const bullet = document.getElementById('bullet-score').value;

    // Frontend validation
    if (!id) {
        showMessage('create', 'Please enter a student ID.', 'error');
        return;
    }

    // Validate ID format: 7 digits + letter (a-e)
    const idPattern = /^\d{7}[a-e]$/;
    if (!idPattern.test(id)) {
        showMessage('create', 'Invalid ID format. Must be 7 digits followed by a letter (a-e), e.g., 2403880d', 'error');
        return;
    }

    if (!rapid || !blitz || !bullet) {
        showMessage('create', 'Please fill in all rating fields.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                rapid: parseInt(rapid),
                blitz: parseInt(blitz),
                bullet: parseInt(bullet)
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('create', `${result.message} Student ID: ${id}`, 'success');

            // Reset form
            document.getElementById('create-form').reset();
            document.getElementById('student-id').value = '';

            // Reload rankings if on view page
            if (typeof loadRankings === 'function') {
                setTimeout(() => loadRankings(), 500);
            }
        } else {
            showMessage('create', result.message, 'error');
        }

    } catch (error) {
        console.error('Error creating student:', error);
        showMessage('create', 'Failed to create account. Please try again.', 'error');
    }
});

// Utility function to show messages
function showMessage(section, message, type) {
    const messageDiv = document.getElementById(`${section}-message`);
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
