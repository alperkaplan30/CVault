document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('.color-box');


    boxes.forEach(box => {
        box.addEventListener('click', () => {
            window.location.href = '/login';
        });
    });
});
