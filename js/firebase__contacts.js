let BASE_URL = 'https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/';
let namesFirstLetters = [];
let contacts = [];
// Hauptinitialisierungsfunktion
async function init() {
    await loadContacts(); // Kontakte laden
    displayContacts(); // Kontakte anzeigen   
}
// Kontakte von Firebase laden
async function loadContacts() {
    // Kontakte von Firebase laden
    let contactsData = await getDataFromFirebase('contacts');
    // Prüfen, ob Daten vorhanden sind
    if (!contactsData) {
        console.error('No data returned from Firebase.');
        return;
    }

    // Initialisiere Arrays
    contacts = [];
    namesFirstLetters = [];
    processContactsData(contactsData);
    sortContactsAndInitials();
}

// Funktion zum Verarbeiten der Kontakte
function processContactsData(contactsData) {
    for (const key in contactsData) {
        if (contactsData.hasOwnProperty(key)) {
            const singleContact = contactsData[key];
            if (singleContact && singleContact.name) {
                addContactToList(key, singleContact);
            } else {
                console.warn(`Skipping invalid contact data for key: ${key}`);
            }
        }
    }
}
// Funktion zum Hinzufügen eines einzelnen Kontakts zur Liste
function addContactToList(key, singleContact) {
    let contact = createContactObject(key, singleContact);
    contacts.push(contact);
    updateInitials(contact.firstInitial);
}

// Funktion zum Erstellen eines Kontaktobjekts
function createContactObject(key, singleContact) {
    return {
        id: key,
        name: singleContact.name,
        email: singleContact.email,
        phone: singleContact.phone,
        emblem: singleContact.emblem,
        color: singleContact.color,
        firstInitial: singleContact.name.charAt(0).toUpperCase(),
        secondInitial: singleContact.name.split(' ')[1]?.charAt(0).toUpperCase() || ''
    };
}

// Funktion zum Aktualisieren der Initialen
function updateInitials(firstInitial) {
    if (!namesFirstLetters.includes(firstInitial)) {
        namesFirstLetters.push(firstInitial);
    }
}

// Funktion zum Sortieren von Kontakten und Initialen
function sortContactsAndInitials() {
    contacts.sort((a, b) => a.firstInitial.localeCompare(b.firstInitial));
    namesFirstLetters.sort();
}

// Anzeigen der Kontakte
function displayContacts() {
    const contactListElement = document.getElementById("contact-list");
    contactListElement.innerHTML = ''; // Lösche den bestehenden Inhalt
    namesFirstLetters.forEach(letter => {
        contactListElement.innerHTML += `
            <div class="contacts-alphabet">${letter}</div>
            <div class="separator"></div>
            <div id="${letter}-content"></div>
        `;
    });
    contacts.forEach(contact => {
        const initial = contact.firstInitial;
        const contentElement = document.getElementById(`${initial}-content`);
        if (contentElement) {
            contentElement.innerHTML += renderContactsHtml(contact);
        }
    });
}
// HTML für einen einzelnen Kontakt generieren
function renderContactsHtml(contact) {
    return `
    <div class="contact-field">
        <div>
            <div class="profile-content" style="background-color: ${contact.color}">
                ${contact.firstInitial}${contact.secondInitial}
            </div>
        </div>
        <div class="contact-data">
            <div>${contact.name}</div>
            <div><a href="mailto:${contact.email}">${contact.email}</a></div>
        </div>
    </div>
    `;
}
// Daten von Firebase holen
async function getDataFromFirebase(path = '') {
    try {
        let response = await fetch(BASE_URL + path + '.json');
        if (!response.ok) {
            console.error('Failed to fetch data from Firebase:', response.statusText);
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return {};
    }
}
// Daten zu Firebase hinzufügen
async function setDataToFirebase(path = '', data = {}) {
    try {
        let response = await fetch(BASE_URL + path + '.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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
// Neuen Kontakt hinzufügen
async function addContact() {
    let contactName = document.getElementById('name').value;
    let contactEmail = document.getElementById('email').value;
    let contactPhone = document.getElementById('phone').value;
    let contactEmblem = document.getElementById('emblem').value;
    let contactColor = document.getElementById('color').value;
    if (!contactName || !contactEmail) {
        alert("Please fill out all required fields.");
        return;
    }
    let contactData = {
        "name": contactName,
        "email": contactEmail,
        "phone": contactPhone,
        "emblem": contactEmblem,
        "color": contactColor
    };
    await setDataToFirebase('contacts', contactData);
    await loadContacts();
    displayContacts();
     // Clear form after adding contact
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('emblem').value = '';
    document.getElementById('color').value = '#ff0000';
}
// Initialisiere beim Laden der Seite
document.addEventListener('DOMContentLoaded', init);
