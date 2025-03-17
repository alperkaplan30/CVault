document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    document.getElementById('profileForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const fileInput = document.getElementById('cv');
        const file = fileInput.files[0];

        
        const address = document.getElementById('address').value;
        const fullname = document.getElementById('fullname').value;
        const country = document.getElementById('country').value;
        const gender = document.getElementById('gender').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const verifyPassword = document.getElementById('verifyPassword').value;

        const formData = new FormData();
        formData.append('address', address);
        formData.append('fullname', fullname);
        formData.append('country', country);
        formData.append('gender', gender);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('verifyPassword', verifyPassword);
        if (file) {
            formData.append('cv', file);
        }

        try {
            const response = await fetch('/submit-profile', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('successMessage').style.display = 'block'; // Baþarý mesajýný göster
                document.getElementById('profileForm').reset(); // Formu sýfýrla

                // Form gönderildiðinde diðer kullanýcýlara bildirim gönder
                socket.emit('formSubmit', {
                    fullname: fullname, 
                    message: 'Hurry up and fill them out too!'
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Diðer kullanýcýlarýn formu doldurduðuna dair mesajlarý al
    socket.on('formUpdate', (data) => {
        const notificationArea = document.getElementById('notificationArea');
        if (notificationArea) {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${data.fullname} has filled the form. ${data.message}`;
            notificationArea.appendChild(messageElement);
        }
    });
});
