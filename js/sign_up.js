document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validatePasswords()) {
        return;
    }

    const fullName = document.getElementById('fullName').value;

    localStorage.setItem('fullName', fullName);
    localStorage.setItem('isGuest', 'false');

    showSuccessPopup();
});

function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordError');
    const privacyPolicy = document.getElementById('privacyPolicy');

    passwordError.style.display = 'none';

    if (password !== confirmPassword) {
        passwordError.textContent = 'Passwords do not match.';
        passwordError.style.display = 'block';
        return false;
    }

    if (!privacyPolicy.checked) {
        passwordError.textContent = 'Please accept the privacy policy.';
        passwordError.style.display = 'block';
        return false;
    }

    return true;
}

function showSuccessPopup() {
    const successPopup = document.getElementById('successPopup');
    successPopup.style.display = 'block';

    setTimeout(() => {
        successPopup.style.bottom = '50%';
    }, 0);

    setTimeout(() => {
        successPopup.style.display = 'none';

        window.location.href = '/html/summary.html';
    }, 1500);
}

function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}
