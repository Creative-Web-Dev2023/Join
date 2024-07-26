function validatePasswords() {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;
    let passwordError = document.getElementById('passwordError');
    let successPopup = document.getElementById('successPopup');
    let privacyPolicy = document.getElementById('privacyPolicy');

    // Verstecken Sie alle Fehler und das Erfolgspopup
    passwordError.style.display = 'none';
    successPopup.style.display = 'none';

    // Überprüfen, ob die Passwörter übereinstimmen
    if (password !== confirmPassword) {
        passwordError.textContent = 'Passwords do not match.';
        passwordError.style.display = 'block';
        console.log("Passwörter stimmen nicht überein");
        return false; // Verhindert das Absenden des Formulars
    }

    // Überprüfen, ob das Häkchen gesetzt ist
    if (!privacyPolicy.checked) {
        passwordError.textContent = 'Please accept the privacy policy.';
        passwordError.style.display = 'block';
        console.log("Datenschutzrichtlinie nicht akzeptiert");
        return false; // Verhindert das Absenden des Formulars
    }

    // Wenn Passwörter übereinstimmen und das Häkchen gesetzt ist
    showSuccessPopup(); // Zeigt das Erfolgspopup an
    console.log("Erfolgspopup wird angezeigt");
    return false; // Verhindert das Absenden des Formulars für Demonstrationszwecke
}

function showSuccessPopup() {
    let successPopup = document.getElementById('successPopup');
    successPopup.style.display = 'block';
    setTimeout(function () {
        successPopup.style.bottom = '50%'; // Animate to the center of the screen
    }, 0); // Ensure the transition starts immediately
    setTimeout(function () {
        successPopup.style.display = 'none'; // Hide completely after the sliding animation
    }, 1500); // Duration of the slide-up animation
}

function togglePasswordVisibility(id) {
    let input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}