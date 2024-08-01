document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    if (!validatePasswords()) {
        return; // Stop if passwords don't match or privacy policy is not accepted
    }

    // Get the user's full name from the form input
    const fullName = document.getElementById('fullName').value;

    // Store the full name in localStorage
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('isGuest', 'false'); // Since a full registration is occurring

    // Show success message and redirect to summary page
    showSuccessPopup();
});

function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordError');
    const privacyPolicy = document.getElementById('privacyPolicy');

    // Hide all error messages
    passwordError.style.display = 'none';

    // Check if passwords match
    if (password !== confirmPassword) {
        passwordError.textContent = 'Passwords do not match.';
        passwordError.style.display = 'block';
        return false; // Prevents form submission
    }

    // Check if privacy policy is accepted
    if (!privacyPolicy.checked) {
        passwordError.textContent = 'Please accept the privacy policy.';
        passwordError.style.display = 'block';
        return false; // Prevents form submission
    }

    return true; // Continue form submission
}

function showSuccessPopup() {
    const successPopup = document.getElementById('successPopup');
    successPopup.style.display = 'block';

    setTimeout(() => {
        successPopup.style.bottom = '50%'; // Animate to the center of the screen
    }, 0); // Ensure the transition starts immediately

    setTimeout(() => {
        successPopup.style.display = 'none'; // Hide completely after the sliding animation

        // Redirect to the summary page after the popup is shown
        window.location.href = '/html/summary.html'; // Adjust path as needed
    }, 1500); // Duration of the slide-up animation
}

function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}
