function validatePasswords() {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;
    let passwordError = document.getElementById('passwordError');
    let successPopup = document.getElementById('successPopup');

    if (password !== confirmPassword) {
        passwordError.style.display = 'block';
        successPopup.style.display = 'none'; // Hide popup if passwords do not match
        return false; // Prevent form submission
    } else {
        passwordError.style.display = 'none';
        showSuccessPopup();
        return false; // Prevent form submission for demo purposes
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

function showSuccessPopup() {
    var successPopup = document.getElementById('successPopup');
    successPopup.style.display = 'block';
    setTimeout(function() {
        successPopup.style.bottom = '50%'; // Animate to the center of the screen
    }, 0); // Ensure the transition starts immediately
    setTimeout(function() {
        successPopup.style.display = 'none'; // Hide completely after the sliding animation
    }, 1500); // Duration of the slide-up animation
}
