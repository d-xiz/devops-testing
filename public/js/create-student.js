/**
 * Daniella - CREATE Feature (Frontend)
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

    // Validate score ranges (0-3000)
    const rapidNum = parseInt(rapid);
    const blitzNum = parseInt(blitz);
    const bulletNum = parseInt(bullet);

    if (isNaN(rapidNum) || isNaN(blitzNum) || isNaN(bulletNum)) {
        showMessage('create', 'All rating fields must be valid numbers.', 'error');
        return;
    }

    if (rapidNum < 0 || rapidNum > 3000 ||
        blitzNum < 0 || blitzNum > 3000 ||
        bulletNum < 0 || bulletNum > 3000) {
        showMessage('create', 'Invalid scores. All ratings must be between 0 and 3000.', 'error');
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
                rapid: rapidNum,
                blitz: blitzNum,
                bullet: bulletNum
            })
        });

        // Handle HTTP errors before parsing JSON
        if (!response.ok) {
            let errorMessage = 'Failed to create account. Please try again.';
            
            try {
                const errorResult = await response.json();
                if (errorResult.message) {
                    errorMessage = errorResult.message;
                }
            } catch (parseError) {
                // If response is not valid JSON, use status-based messages
                if (response.status === 409) {
                    errorMessage = 'Student ID already exists. Please use a different ID.';
                } else if (response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (response.status === 400) {
                    errorMessage = 'Invalid request. Please check your input.';
                }
            }
            
            showMessage('create', errorMessage, 'error');
            return;
        }

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
            showMessage('create', result.message || 'Failed to create account.', 'error');
        }

    } catch (error) {
        // Handle network errors (no connection, server unreachable, etc.)
        console.error('Error creating student:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            showMessage('create', 'Network error. Please check your connection and try again.', 'error');
        } else {
            showMessage('create', 'An unexpected error occurred. Please try again.', 'error');
        }
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
