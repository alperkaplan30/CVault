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


//fetch ile login url'ine bir post isteði gönderilir. username ve password string olarak json formatýnda response'un gövdesine ekler
//sunucudan gelen yanýtý json formatýnda ayrýþtýrýrak data deðiþkenine atar ve deðer data success ise /profile'e yönlendirir.