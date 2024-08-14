

// Überprüft die Übereinstimmung der Passwörter und ob die Datenschutzrichtlinie akzeptiert wurde
function validatePasswords() {
    const password = document.getElementById('password').value; // Holt das Passwort vom Formular
    const confirmPassword = document.getElementById('confirmPassword').value; // Holt das Bestätigungs-Passwort
    const passwordError = document.getElementById('passwordError'); // Holt das Fehler-Element für Passwörter
    const privacyPolicy = document.getElementById('privacyPolicy'); // Holt das Datenschutzrichtlinien-Checkbox-Element
    resetError(passwordError); // Setzt die Fehlermeldung zurück
    // Überprüft, ob die Passwörter übereinstimmen
    if (!arePasswordsMatching(password, confirmPassword, passwordError)) {
        return false; // Gibt false zurück, wenn die Passwörter nicht übereinstimmen
    }
    // Überprüft, ob die Datenschutzrichtlinie akzeptiert wurde
    if (!isPrivacyPolicyAccepted(privacyPolicy, passwordError)) {
        return false; // Gibt false zurück, wenn die Datenschutzrichtlinie nicht akzeptiert wurde
    }
    return true; // Gibt true zurück, wenn alles gültig ist
}

// Setzt die Fehlermeldung des übergebenen Elements zurück
function resetError(errorElement) {
    errorElement.style.display = 'none'; // Versteckt die Fehlermeldung
}

// Überprüft, ob die Passwörter übereinstimmen und zeigt ggf. eine Fehlermeldung an
function arePasswordsMatching(password, confirmPassword, errorElement) {
    if (password === confirmPassword) {
        return true; // Gibt true zurück, wenn die Passwörter übereinstimmen
    }
    showError(errorElement, 'Passwords do not match.'); // Zeigt eine Fehlermeldung an
    return false; // Gibt false zurück, wenn die Passwörter nicht übereinstimmen
}

// Überprüft, ob die Datenschutzrichtlinie akzeptiert wurde und zeigt ggf. eine Fehlermeldung an
function isPrivacyPolicyAccepted(privacyPolicyCheckbox, errorElement) {
    if (privacyPolicyCheckbox.checked) {
        return true; // Gibt true zurück, wenn die Datenschutzrichtlinie akzeptiert wurde
    }
    showError(errorElement, 'Please accept the privacy policy.'); // Zeigt eine Fehlermeldung an
    return false; // Gibt false zurück, wenn die Datenschutzrichtlinie nicht akzeptiert wurde
}

// Zeigt eine Fehlermeldung im übergebenen Fehler-Element an
function showError(errorElement, message) {
    errorElement.textContent = message; // Setzt den Fehlermeldungstext
    errorElement.style.display = 'block'; // Zeigt die Fehlermeldung an
}

// Zeigt ein Erfolgspopup an und leitet nach 1,5 Sekunden zur Zusammenfassungsseite weiter
function showSuccessPopup() {
    const successPopup = document.getElementById('successPopup'); // Holt das Erfolgspopup-Element
    successPopup.style.display = 'block'; // Zeigt das Erfolgspopup an
    setTimeout(() => {
        successPopup.style.bottom = '50%'; // Positioniert das Popup in der Mitte des Bildschirms
    }, 0);
    setTimeout(() => {
        successPopup.style.display = 'none'; // Versteckt das Erfolgspopup nach 1,5 Sekunden
        window.location.href = '/html/summary.html'; // Leitet zur Zusammenfassungsseite weiter
    }, 1500);
}

// Wechselt zwischen Passwort- und Klartextmodus für ein Eingabefeld
function togglePasswordVisibility(id) {
    const input = document.getElementById(id); // Holt das Eingabefeld-Element
    if (input.type === 'password') {
        input.type = 'text'; // Wechselt zu Klartextmodus
    } else {
        input.type = 'password'; // Wechselt zurück zu Passwortmodus
    }
}

// Überprüft beim Laden der Seite, ob alle erforderlichen Eingabefelder ausgefüllt sind und die Datenschutzrichtlinie akzeptiert wurde
document.addEventListener('DOMContentLoaded', function () {
    const signUpButton = document.getElementById('signUpButton'); // Holt den Anmelde-Button
    const inputs = document.querySelectorAll('#signupForm input[required]'); // Holt alle erforderlichen Eingabefelder
    const privacyPolicy = document.getElementById('privacyPolicy'); // Holt das Datenschutzrichtlinien-Checkbox-Element
    // Überprüft, ob alle Eingabefelder ausgefüllt sind und die Datenschutzrichtlinie akzeptiert wurde
    function checkInputs() {
        const allFilled = areInputsFilled(inputs); // Überprüft, ob alle Eingabefelder ausgefüllt sind
        signUpButton.disabled = !(allFilled && privacyPolicy.checked); // Setzt den Zustand des Anmelde-Buttons
    }
    // Fügt Event-Listener für Eingaben in erforderlichen Feldern hinzu
    inputs.forEach(input => input.addEventListener('input', checkInputs));
    // Fügt Event-Listener für Änderungen an der Datenschutzrichtlinie hinzu
    privacyPolicy.addEventListener('change', checkInputs);
    checkInputs(); // Initiale Überprüfung, um den Zustand des Buttons beim Laden der Seite festzulegen
});

// Überprüft, ob alle Eingabefelder ausgefüllt sind
function areInputsFilled(inputs) {
    return Array.from(inputs).every(input => input.value.trim() !== ''); // Gibt true zurück, wenn alle Felder ausgefüllt sind
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.(de|com)$/;
    return emailPattern.test(email);
}

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    // Call the submitContactFB function
    submitContactFB(event);
});

async function submitContactFB(event) {
    // Prevents the default form submission behavior (redundant if already called in the event listener)
    event.preventDefault(); 

    let contactName = document.getElementById("fullName").value;
    let contactEmail = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    // Reset error messages visibility
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    let isValid = true;

    // Validate Passwords
    if (!validatePasswords()) {
        isValid = false;
    }

    // Validate Email
    if (!validateEmail(contactEmail)) {
        emailError.textContent = 'Please enter a valid email address ending in .de or .com';
        emailError.style.display = 'block';
        isValid = false;
    }

    // Check if all required fields are filled
    if (!contactName || !contactEmail) {
        alert("Please fill out all required fields.");
        isValid = false;
    }

    // Stop further processing if validation fails
    if (!isValid) {
        return;
    }

    // Prepare contact data for submission
    let contactData = {
        name: contactName,
        email: contactEmail,
        color: generateRandomColor(),
        emblem: generateEmblem(contactName),
        password: password
    };

    try {
        // Submit data to Firebase
        await addContactToFirebase(contactData);

        // Store the user's name in localStorage for later use (e.g., displaying initials)
        localStorage.setItem('fullName', contactName);
        localStorage.setItem('isGuest', 'false'); // Indicate that the user is not a guest

        // Show success popup after successful submission
        showSuccessPopup();

        // Clear the form fields
        document.getElementById("fullName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirmPassword").value = "";

    } catch (error) {
        console.error("Failed to submit contact data:", error);
        alert("There was an error submitting your data. Please try again.");
    }
}



function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateEmblem(name) {
    const nameParts = name.trim().split(' ');
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const secondInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
    return firstInitial + secondInitial;
}

async function addContactToFirebase(contactData) {
    let BASE_URL =
        "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
    try {
        let response = await fetch(BASE_URL + "contacts.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(contactData),
        });
        if (!response.ok) {
            console.error("Failed to set data to Firebase:", response.statusText);
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error("Error setting data:", error);
        return {};
    }
}