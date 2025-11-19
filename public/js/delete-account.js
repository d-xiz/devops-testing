/**
 * Member D - DELETE Feature (Frontend)
 * Handles student account deletion (leaving the club)
 */

// Handle delete form submission
document.getElementById('delete-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('delete-id').value.trim();
    const confirmed = document.getElementById('confirm-delete').checked;

    // Validation
    if (!id) {
        showDeleteMessage('Please enter your Student ID.', 'error');
        return;
    }

    if (!confirmed) {
        showDeleteMessage('Please confirm that you want to delete your account.', 'error');
        return;
    }

    // Additional confirmation dialog
    const confirmDialog = confirm(
        `FINAL WARNING\n\n` +
        `Are you absolutely sure you want to delete account ${id}?\n\n` +
        `This will permanently delete:\n` +
        `- Your student record\n` +
        `- All your ratings (Rapid, Blitz, Bullet)\n` +
        `- Your ranking history\n\n` +
        `This action CANNOT be undone!`
    );

    if (!confirmDialog) {
        showDeleteMessage('Account deletion cancelled.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showDeleteMessage(
                `${result.message}\n\n` +
                `Deleted Account Details:\n` +
                `ID: ${result.deletedStudent.id}\n` +
                `Rapid: ${result.deletedStudent.rapid}\n` +
                `Blitz: ${result.deletedStudent.blitz}\n` +
                `Bullet: ${result.deletedStudent.bullet}\n\n` +
                `Remaining students: ${result.remainingStudents}`,
                'success'
            );

            // Reset form
            document.getElementById('delete-form').reset();

            // Reload rankings if on view page
            if (typeof loadRankings === 'function') {
                setTimeout(() => loadRankings(), 1000);
            }

        } else {
            showDeleteMessage(result.message, 'error');
        }

    } catch (error) {
        console.error('Error deleting account:', error);
        showDeleteMessage('Failed to delete account. Please try again.', 'error');
    }
});

// Show message for delete section
function showDeleteMessage(message, type) {
    const messageDiv = document.getElementById('delete-message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide messages after 8 seconds for delete (longer for important action)
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 8000);
}
