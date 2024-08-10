// Event-Listener für den Login-Button
document.getElementById('loginButton').addEventListener('click', () => {
    // Speichert den Anmeldestatus als Gast im lokalen Speicher
    localStorage.setItem('isGuest', 'true');
    // Weiterleitung zur Begrüßungsseite
    window.location.href = '../html/summary.html';
});

// Funktion zum Öffnen der Registrierungsseite
function openSignUpPage() {
    window.location.href = './html/sign_up.html'; // URL der Registrierungsseite
}

// Funktion zum Öffnen der Datenschutzrichtlinien-Seite
function openPrivacyPolicyPage() {
    window.location.href = '../html/privacy_policy_noconto.html'; // URL der Datenschutzrichtlinie
}

// Funktion zum Öffnen der rechtlichen Hinweise-Seite
function openLegalNoticePage() {
    window.location.href = '../html/legal_notice_noconto.html'; // URL der rechtlichen Hinweise
}

// Funktion zum Zurücksetzen der Umrandung eines Eingabefelds bei Fokus
function resetOutline(fieldId) {
    document.getElementById(fieldId).style.outline = ''; // Entfernt die Umrandung
}

// Funktion zur Validierung der Login-Daten
function login() {
    const email = getInputValue('email'); // Holt die E-Mail-Adresse
    const password = getInputValue('password'); // Holt das Passwort
    const rememberMe = document.getElementById('checkbox').checked; // Holt den Status des "Remember Me"-Checkbox
    let isValid = validateEmail(email) && validatePassword(password); // Validiert die E-Mail und das Passwort
    if (isValid) {
        handleLoginSuccess(); // Bei erfolgreicher Validierung
    }
}

// Holt den Wert eines Eingabefeldes und entfernt überflüssige Leerzeichen
function getInputValue(id) {
    return document.getElementById(id).value.trim(); // Gibt den bereinigten Wert des Feldes zurück
}

// Validiert die E-Mail-Adresse
function validateEmail(email) {
    if (email === '') {
        displayErrorMessage('email', 'Please enter an email address.'); // Zeigt Fehlermeldung an
        return false; // Gibt false zurück
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Please enter a valid email address.'); // Zeigt Fehlermeldung an
        return false; // Gibt false zurück
    }
    return true; // Gibt true zurück, wenn die E-Mail gültig ist
}

// Validiert das Passwort
function validatePassword(password) {
    if (password === '') {
        displayErrorMessage('password', 'Please enter your password.'); // Zeigt Fehlermeldung an
        return false; // Gibt false zurück
    } else if (password.length < 3) {
        displayErrorMessage('password', 'The password must be at least 3 characters long.'); // Zeigt Fehlermeldung an
        return false; // Gibt false zurück
    }
    return true; // Gibt true zurück, wenn das Passwort gültig ist
}

// Behandelt den erfolgreichen Login
function handleLoginSuccess() {
    alert('Login successful!'); // Zeigt eine Erfolgsnachricht an
    window.location.href = '.html'; // Weiterleitung zur Zielseite (bitte anpassen)
}

// Wechselt das Icon des "Remember Me"-Checkbox zwischen ausgewählt und nicht ausgewählt
function checkIcon() {
    const checkbox = document.getElementById('checkbox');
    if (checkbox.classList.contains('unchecked')) {
        checkbox.classList.remove('unchecked');
        checkbox.classList.add('checked');
        checkbox.src = '../assets/img/img_login/checkmark_checked_dark.png'; // Setzt das Häkchen-Icon
    } else {
        checkbox.classList.remove('checked');
        checkbox.classList.add('unchecked');
        checkbox.src = '../assets/img/img_login/checkmark-empty_dark.png'; // Setzt das leere Häkchen-Icon
    }
}

// Zeigt eine Fehlermeldung für das angegebene Feld an
function displayErrorMessage(fieldId, message) {
    const messageBoxId = `messagebox${capitalizeFirstLetter(fieldId)}`; // Baut die ID für die Nachrichtbox
    const messageBox = document.getElementById(messageBoxId); // Holt das Nachrichtbox-Element
    messageBox.innerText = message; // Setzt den Fehlermeldungstext
    document.getElementById(fieldId).style.outline = '2px solid red'; // Markiert das Feld mit einer roten Umrandung
}

// Überprüft, ob die E-Mail-Adresse gültig ist
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // RegEx-Muster für E-Mail-Validierung
    return emailPattern.test(email); // Gibt true zurück, wenn die E-Mail gültig ist
}

// Wandelt den ersten Buchstaben eines Strings in Großbuchstaben um
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1); // Gibt den String mit großem ersten Buchstaben zurück
}
