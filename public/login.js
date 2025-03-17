    document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;


    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
        window.location.href = `/profile?`;
    } else {
        alert('Login failed');
    }
});

document.getElementById('registerButton').addEventListener('click', () => {
    window.location.href = '/register';
});

document.getElementById('forgotpasswordButton').addEventListener('click', () => {
    window.location.href = '/resetpassword';
});


//fetch ile login url'ine bir post iste�i g�nderilir. username ve password string olarak json format�nda response'un g�vdesine ekler
//sunucudan gelen yan�t� json format�nda ayr��t�r�rak data de�i�kenine atar ve de�er data success ise /profile'e y�nlendirir.