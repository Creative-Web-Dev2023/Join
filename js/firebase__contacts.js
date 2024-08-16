let BASE_URL = 'https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/';
let namesFirstLetters = [];
let contacts = [];

async function init() {
    await loadContacts();
    displayContacts(); // Kontakte anzeigen   
}

async function loadContacts() {
    let contactsData = await getDataFromFirebase('contacts');
    if (!contactsData) {
        console.error('No data returned from Firebase.');
        return;
    }
    contacts = [];
    namesFirstLetters = [];
    processContactsData(contactsData);
    sortContactsAndInitials();
}

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

function addContactToList(key, singleContact) {
    let contact = createContactObject(key, singleContact);
    contacts.push(contact);
    updateInitials(contact.firstInitial);
}


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

function updateInitials(firstInitial) {
    if (!namesFirstLetters.includes(firstInitial)) {
        namesFirstLetters.push(firstInitial);
    }
}


function sortContactsAndInitials() {
    contacts.sort((a, b) => a.firstInitial.localeCompare(b.firstInitial));
    namesFirstLetters.sort();
}

function displayContacts() {
    const contactListElement = document.getElementById("contact-list");
    contactListElement.innerHTML = '';
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
    makeContactsClickable(); // Event-Listener hinzufügen
}



function renderContactsHtml(contact) {
    return `
    <div class="contact-field" id="contact-${contact.id}" onclick="makeContactsClickable()">
        <div>
            <div class="profile-content" style="background-color: ${contact.color}">
                ${contact.firstInitial}${contact.secondInitial}
            </div>
        </div>
        <div class="contact-data">
            <div>${contact.name}</div>
            <div><a href="${contact.email}">${contact.email}</a></div>
        </div>
    </div>
    <div class="add_contact" id="addContact" onclick="openModal()">
        <img class="hoverr" src="/assets/img/img_contacts/add_contact.png" alt="">
    </div>
    `;
}

async function deleteThis(contactId) {
  
    // Call the deleteContactFromFirebase function to remove the contact
    await deleteContactFromFirebase(contactId);
  
    // Reload contacts and update the UI
    await loadContacts();
    displayContacts();
  }
  
  function editThis(contactId) {
    // Find the contact to be edited by its ID
    const contact = contacts.find(c => c.id === contactId);
  
    if (!contact) {
      console.error("Contact not found for editing.");
      return;
    }
  
    // Open the modal in edit mode and pass the contact to be edited
    openEditContactModal(contact);
  }
  
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

async function addContact() {
    let contactName = document.getElementById('name').value;
    let contactEmail = document.getElementById('email').value;
    let contactPhone = document.getElementById('phone').value;

    if (!contactName || !contactEmail) {
        return;
    }

    let contactData = {
        "name": contactName,
        "email": contactEmail,
        "phone": contactPhone,
        "color": generateRandomColor(),
        "emblem": generateEmblem(contactName)
    };

    await setDataToFirebase('contacts', contactData);

    await loadContacts();
    displayContacts();

    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
}

async function deleteContact(contactId) {
    try {
        let response = await fetch(BASE_URL + 'contacts/' + contactId + '.json', {
            method: 'DELETE'
        });
        if (!response.ok) {
            console.error('Failed to delete data in Firebase:', response.statusText);
            return {};
        }
        location.reload();
        return await response.json();
    } catch (error) {
        console.error('Error deleting data:', error);
        return {};
    }
}
document.addEventListener('DOMContentLoaded', init);
