document.getElementById('loginButton').addEventListener('click', () => {
    // Speichert den Anmeldestatus als Gast
    localStorage.setItem('isGuest', 'true');
    // Weiterleitung zur Begrüßungsseite
    window.location.href = '../html/summary.html';
});

// Funktion zum Öffnen der Anmeldeseite
function openSignUpPage() {
<<<<<<< HEAD
    window.location.href = './html/sign_up.html'; // URL der Registrierungsseite
=======
    window.location.href = '../html/sign_up.html'; // URL der Registrierungsseite
>>>>>>> 506234dd579c3cea156d3e6536a49625d004b42b
}

// Funktion zum Öffnen der Datenschutzrichtlinienseite
function openPrivacyPolicyPage() {
    window.location.href = '../html/privacy_policy_noconto.html'; // URL der Datenschutzrichtlinie
}

// Funktion zum Öffnen der rechtlichen Hinweise
function openLegalNoticePage() {
    window.location.href = '../html/legal_notice_noconto.html'; // URL der rechtlichen Hinweise
}

// Funktion zum Zurücksetzen der Umrandung bei Fokus
function resetOutline(fieldId) {
    document.getElementById(fieldId).style.outline = '';
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
