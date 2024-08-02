document.getElementById('loginButton').addEventListener('click', () => {
    // Speichert den Anmeldestatus als Gast
    localStorage.setItem('isGuest', 'true');
    // Weiterleitung zur Begrüßungsseite
    window.location.href = '../html/summary.html';
});

// Funktion zum Öffnen der Anmeldeseite
function openSignUpPage() {
    window.location.href = './html/sign_up.html'; // URL der Registrierungsseite
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
        displayErrorMessage('email', 'Please enter an email address.');
        isValid = false;
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Please enter a valid email address.');
        isValid = false;
    }
    if (password === '') {
        displayErrorMessage('password', 'Please enter your passwort.');
        isValid = false;
    } else if (password.length < 3) {
        displayErrorMessage('password', 'The password must be at least 3 characters long');
        isValid = false;
    }
    if (isValid) {
        alert('Login successful!');
        window.location.href = '.html'; 
    }
}


function checkIcon() {
    const checkbox = document.getElementById('checkbox');
    if (checkbox.classList.contains('unchecked')) {
        checkbox.classList.remove('unchecked');
        checkbox.classList.add('checked');
        checkbox.src = '../assets/img/img_login/checkmark_checked_dark.png';
    } else {
        checkbox.classList.remove('checked');
        checkbox.classList.add('unchecked');
        checkbox.src = '../assets/img/img_login/checkmark-empty_dark.png';
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
