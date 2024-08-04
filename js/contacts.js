
function openModal() {
    document.getElementById('contact-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('contact-modal').style.display = 'none';
}

// Funktion zum Einreichen des Formulars
async function submitContact() {
    let contactName = document.getElementById('name-input').value;
    let contactEmail = document.getElementById('email-input').value;
    let contactPhone = document.getElementById('phone-input').value;

    if (!contactName || !contactEmail || !contactPhone) {
        alert("Please fill out all required fields.");
        return;
    }

    let contactData = {
        name: contactName,
        email: contactEmail,
        phone: contactPhone
    };
    await addContactToFirebase(contactData);
    // Formular zurücksetzen
    document.getElementById('name-input').value = '';
    document.getElementById('email-input').value = '';
    document.getElementById('phone-input').value = '';
    closeModal();
    await loadContacts();
    displayContacts();
}

// Funktion zum Hinzufügen eines Kontakts zu Firebase
async function addContactToFirebase(contactData) {
    let BASE_URL = 'https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/';
    try {
        let response = await fetch(BASE_URL + 'contacts.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        if (!response.ok) {
            console.error('Failed to set data to Firebase:', response.statusText);
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error setting data:', error);
        return {};
    }
}
// Event-Listener zum Öffnen und Schließen des Modals und zum Einreichen des Formulars
document.getElementById('add-contact-button').onclick = openModal;
document.getElementById('cancel-button').onclick = closeModal;
document.getElementById('submit-button').onclick = submitContact;
document.getElementById('close-modal-button').onclick = closeModal;
