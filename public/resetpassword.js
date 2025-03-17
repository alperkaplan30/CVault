document.getElementById('resetpasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const newPassword = document.getElementById('newPassword').value;
    const newconfirmPassword = document.getElementById('newconfirmPassword').value;

    if (newPassword !== newconfirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const response = await fetch('/resetpassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, newPassword, newconfirmPassword })
    });

    const data = await response.json();

    if (data.success) {
        alert('Password change succesful!');
        window.location.href = '/login';
    } else {
        alert('Invalid username!');
    }
});