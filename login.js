// Funktion zum Öffnen der Anmeldeseite
function openSignUpPage() {
    window.location.href = 'sign_up.html'; // URL der Registrierungsseite
}

// Funktion zum Öffnen der Datenschutzrichtlinienseite
function openPrivacyPolicyPage() {
    window.location.href = 'privacy_policy.html'; // URL der Datenschutzrichtlinie
}

// Funktion zum Öffnen der rechtlichen Hinweise
function openLegalNoticePage() {
    window.location.href = 'legal_notice.html'; // URL der rechtlichen Hinweise
}

// Funktion zum Zurücksetzen der Umrandung bei Fokus
function resetOutline(fieldId) {
    document.getElementById(fieldId).style.outline = '';
}

// Funktion für den Gast-Login
function guestLogin() {
    alert('Gast-Login noch nicht implementiert');
}


function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('checkbox').checked;
    let isValid = true; 
    if (email === '') {
        displayErrorMessage('email', 'Bitte geben Sie eine E-Mail-Adresse ein.');
        isValid = false;
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        isValid = false;
    }

    // Passwort Validierung
    if (password === '') {
        displayErrorMessage('password', 'Bitte geben Sie ein Passwort ein.');
        isValid = false;
    } else if (password.length < 3) {
        displayErrorMessage('password', 'Das Passwort muss mindestens 3 Zeichen lang sein.');
        isValid = false;
    }

    if (isValid) {
        alert('Anmeldung erfolgreich!');
         window.location.href = '.html'; 
    }
}


function displayErrorMessage(fieldId, message) {
    const messageBoxId = `messagebox${capitalizeFirstLetter(fieldId)}`;
    const messageBox = document.getElementById(messageBoxId);
    messageBox.innerText = message;
    document.getElementById(fieldId).style.outline = '2px solid red';
}


function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
