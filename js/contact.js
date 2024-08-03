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
    let contactsData = await getDataFromFirebase('contacts'); // Korrektur: 'contacts' Pfad hier hinzufügen
    contacts = [];
    namesFirstLetters = [];

    for (const key in contactsData) {
        const SINGLE_CONTACT = contactsData[key];
        let contact = {
            "id": key,
            "name": SINGLE_CONTACT.name,
            "email": SINGLE_CONTACT.email,
            "phone": SINGLE_CONTACT.phone,
            "emblem": SINGLE_CONTACT.emblem,
            "color": SINGLE_CONTACT.color,
            "firstInitial": SINGLE_CONTACT.name.charAt(0).toUpperCase(),
            "secondInitial": SINGLE_CONTACT.name.split(' ')[1]?.charAt(0).toUpperCase() || ''
        };
        contacts.push(contact);

        // Fügt den ersten Buchstaben des Namens zum Array hinzu, wenn er nicht vorhanden ist
        if (!namesFirstLetters.includes(contact.firstInitial)) {
            namesFirstLetters.push(contact.firstInitial);
        }
    }

    // Sortieren der Kontakte und Initialen
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
}


document.addEventListener('DOMContentLoaded', init);
