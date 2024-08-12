// Event listener für das Formular-Submit-Ereignis
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Verhindert das Standard-Formular-Submit-Verhalten (Seiten-Neuladen)
    if (!validatePasswords()) { // Überprüft, ob die Passwörter korrekt sind und die Datenschutzrichtlinie akzeptiert wurde
        return; // Falls die Validierung fehlschlägt, wird die Weiterverarbeitung abgebrochen
    }
    const fullName = document.getElementById('fullName').value; // Holt den vollständigen Namen vom Formular
    localStorage.setItem('fullName', fullName); // Speichert den Namen im lokalen Speicher
    localStorage.setItem('isGuest', 'false'); // Setzt den Status als Nicht-Gast im lokalen Speicher
    showSuccessPopup(); // Zeigt ein Erfolgspopup an
});

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

async function submitContactFB() {
    let contactName = document.getElementById("fullName").value;
    let contactEmail = document.getElementById("email").value;
  
    if (!contactName || !contactEmail) {
      alert("Please fill out all required fields.");
      return;
    }
  
    let contactData = {
      name: contactName,
      email: contactEmail,
      color: generateRandomColor(),
      emblem: generateEmblem(contactName)
    };
  
    await addContactToFirebase(contactData);
  
    document.getElementById("fullName").value = "";
    document.getElementById("email").value = "";

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