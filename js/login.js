document.getElementById('loginButton').addEventListener('click', () => {
    localStorage.setItem('isGuest', 'true');
    window.location.href = '../html/summary.html';
});

document.addEventListener('DOMContentLoaded', function () {
    const isGuest = localStorage.getItem('isGuest');
    const fullName = localStorage.getItem('fullName');

    if (isGuest === 'false' && fullName) {
        console.log(`Welcome back, ${fullName}!`);
        // Hier könntest du den Namen des Benutzers auf der Seite anzeigen
    } else {
        console.log('Welcome, guest!');
    }
});

function openSignUpPage() {
    window.location.href = './html/sign_up.html';
}

function openPrivacyPolicyPage() {
    window.location.href = '../html/privacy_policy_noconto.html';
}

function openLegalNoticePage() {
    window.location.href = '../html/legal_notice_noconto.html';
}

function resetOutline(fieldId) {
    document.getElementById(fieldId).style.outline = '';
}

function login() {
    const email = getInputValue('email');
    const password = getInputValue('password');
    const rememberMe = document.getElementById('checkbox').checked;

    let isValid = validateEmail(email) && validatePassword(password);
    if (!isValid) {
        return;
    }

    // Daten von der Firebase-Datenbank abrufen
    fetch('https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
    .then(response => response.json())
    .then(data => {
        let userFound = false;
        
        // Überprüfen, ob die Anmeldedaten mit einem Benutzer übereinstimmen
        for (let key in data) {
            if (data[key].email === email && data[key].password === password) {
                userFound = true;
                // Speichere den Namen des Benutzers und setze isGuest auf false
                localStorage.setItem('fullName', data[key].name);
                localStorage.setItem('isGuest', 'false');

                handleLoginSuccess(data[key], rememberMe); // Erfolgreiche Anmeldung
                break;
            }
        }

        if (!userFound) {
            displayErrorMessage('email', 'Invalid email or password.'); // Fehlerhafte Anmeldung
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage('email', 'An error occurred. Please try again later.');
    });
}


function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

function validateEmail(email) {
    if (email === '') {
        displayErrorMessage('email', 'Please enter an email address.');
        return false;
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Please enter a valid email address.');
        return false;
    }
    return true;
}

function validatePassword(password) {
    if (password === '') {
        displayErrorMessage('password', 'Please enter your password.');
        return false;
    } else if (password.length < 3) {
        displayErrorMessage('password', 'The password must be at least 3 characters long.');
        return false;
    }
    return true;
}

function handleLoginSuccess(user, rememberMe) {
    const token = btoa(`${user.email}:${user.password}`); // Einfache Kodierung als Token (nur ein Beispiel)
    
    if (rememberMe) {
        localStorage.setItem('authToken', token);
    } else {
        sessionStorage.setItem('authToken', token);
    }

    // Leite den Benutzer zur Zusammenfassungsseite weiter
    window.location.href = './html/summary.html';
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
