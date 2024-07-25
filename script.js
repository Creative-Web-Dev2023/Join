function validatePasswords() {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;
    let passwordError = document.getElementById('passwordError');

    if (password !== confirmPassword) {
        passwordError.style.display = 'block';
        return false; // Prevent form submission
    } else {
        passwordError.style.display = 'none';
        return true; // Allow form submission
    }
}

function togglePasswordVisibility(id) {
    let input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

