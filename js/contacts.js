function openModal(isEditMode = false, contact = null) {
  CreateSvg();

  const submitButton = document.getElementById("submit-button");

  // Entferne vorherige Eventlistener für den Button
  submitButton.removeEventListener('click', submitContact);
  submitButton.removeEventListener('click', updateContact);

  if (isEditMode && contact) {
    // Bearbeitungsmodus: Felder mit den Kontaktinformationen befüllen
    document.getElementById("name-input").value = contact.name;
    document.getElementById("email-input").value = contact.email;
    document.getElementById("phone-input").value = contact.phone;

    // Zeige den Bearbeitungsmodus
    document.getElementById('contactEdit').style.display = 'block';
    document.getElementById('contactAdd').style.display = 'none';

    submitButton.textContent = "Update contact";

    // Füge den Update-Eventlistener hinzu
    submitButton.addEventListener('click', function updateContact(event) {
      event.preventDefault();
      
      let updatedContactData = {
        name: document.getElementById("name-input").value,
        email: document.getElementById("email-input").value,
        phone: document.getElementById("phone-input").value,
        color: contact.color || generateRandomColor(),
        emblem: generateEmblem(document.getElementById("name-input").value)
      };

      updateContactInFirebase(contact.id, updatedContactData).then(() => {
        closeModal();
        loadContacts().then(displayContacts);
      });
    });
  } else {
    // Hinzufügen-Modus: Felder leeren
    document.getElementById("name-input").value = "";
    document.getElementById("email-input").value = "";
    document.getElementById("phone-input").value = "";

    // Zeige den Hinzufügen-Modus
    document.getElementById('contactEdit').style.display = 'none';
    document.getElementById('contactAdd').style.display = 'block';

    submitButton.textContent = "Create contact";

    // Füge den Eventlistener zum Erstellen eines Kontakts hinzu
    submitButton.addEventListener('click', submitContact);
  }

  // Zeige das Modal an
  document.getElementById("contact-modal").style.display = "block";
}


async function updateContact(event) {
  event.preventDefault();

  let updatedContactData = {
    name: document.getElementById("name-input").value,
    email: document.getElementById("email-input").value,
    phone: document.getElementById("phone-input").value,
    color: contact.color || generateRandomColor(),
    emblem: generateEmblem(document.getElementById("name-input").value)
  };

  await updateContactInFirebase(contact.id, updatedContactData);
  closeModal();
  await loadContacts();
  displayContacts();
}



function openEditContactModal(contact) {
  contactLogo(contact);

  const submitButton = document.getElementById("submit-button");
  
  // Entferne vorherige Eventlistener
  submitButton.removeEventListener('click', submitContact);
  submitButton.removeEventListener('click', updateContact);

  // Felder mit den Kontaktinformationen befüllen
  document.getElementById("name-input").value = contact.name;
  document.getElementById("email-input").value = contact.email;
  document.getElementById("phone-input").value = contact.phone;

  // Zeige den Bearbeitungsmodus
  document.getElementById('contactEdit').style.display = 'block';
  document.getElementById('contactAdd').style.display = 'none';
  document.getElementById('contactAddSmall').style.display = 'none';

  submitButton.textContent = "Update contact";

  // Eventlistener hinzufügen für das Aktualisieren
  submitButton.addEventListener('click', async function(event) {
    event.preventDefault(); // Verhindere das Standardverhalten

    // Überprüfe die Validierung, bevor der Kontakt aktualisiert wird
    if (!validateForm()) {
      return; // Stoppe hier, wenn die Validierung fehlschlägt
    }

    let updatedContactData = {
      name: document.getElementById("name-input").value,
      email: document.getElementById("email-input").value,
      phone: document.getElementById("phone-input").value,
      color: contact.color || generateRandomColor(),
      emblem: generateEmblem(document.getElementById("name-input").value)
    };

    await updateContactInFirebase(contact.id, updatedContactData);
    closeModal();
    await loadContacts();
    displayContacts();
  });

  // Zeige das Modal an
  document.getElementById("contact-modal").style.display = "block";
}

function validateForm() {
  let isValid = true;

  const contactName = document.getElementById("name-input").value;
  const contactEmail = document.getElementById("email-input").value;
  const contactPhone = document.getElementById("phone-input").value;

  // Entferne vorherige Fehlerklassen
  document.getElementById("name-input").classList.remove("input-error");
  document.getElementById("email-input").classList.remove("input-error");
  document.getElementById("phone-input").classList.remove("input-error");

  // Name validieren
  if (!contactName) {
    document.getElementById("name-input").classList.add("input-error");
    isValid = false;
  }

  // E-Mail validieren
  if (!contactEmail || !isValidEmail(contactEmail)) {
    document.getElementById("email-input").classList.add("input-error");
    isValid = false;
  }

  // Telefonnummer validieren
  if (!contactPhone || !isValidPhoneNumber(contactPhone)) {
    document.getElementById("phone-input").classList.add("input-error");
    isValid = false;
  }

  return isValid;  // Gibt true zurück, wenn alles gültig ist, ansonsten false
}



function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
  window.location.href = '/html/contacts.html';
}

function isValidPhoneNumber(phone) {
  const phonePattern = /^[0-9+\s-()]+$/;
  return phonePattern.test(phone);
}

async function submitContact(event) {
  event.preventDefault();  // Verhindere das Standard-Formularverhalten

  let contactName = document.getElementById("name-input").value;
  let contactEmail = document.getElementById("email-input").value;
  let contactPhone = document.getElementById("phone-input").value;

  // Entferne vorherige Fehlerklassen
  document.getElementById("name-input").classList.remove("input-error");
  document.getElementById("email-input").classList.remove("input-error");
  document.getElementById("phone-input").classList.remove("input-error");

  let isValid = true;

  // Name validieren
  if (!contactName) {
    document.getElementById("name-input").classList.add("input-error");
    isValid = false;
  }

  // E-Mail validieren
  if (!contactEmail || !isValidEmail(contactEmail)) {
    document.getElementById("email-input").classList.add("input-error");
    isValid = false;
  }

  // Telefonnummer validieren
  if (!contactPhone || !isValidPhoneNumber(contactPhone)) {
    document.getElementById("phone-input").classList.add("input-error");
    isValid = false;
  }

  // Wenn die Validierung fehlschlägt, breche die Funktion ab und lasse das Modal offen
  if (!isValid) {
    return;
  }

  // Wenn die Validierung erfolgreich ist, erstelle die Kontaktdaten
  let contactData = {
    name: contactName,
    email: contactEmail,
    phone: contactPhone,
    color: generateRandomColor(),
    emblem: generateEmblem(contactName)
  };

  // Daten an Firebase senden
  await addContactToFirebase(contactData);

  // Felder leeren
  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";

  // Modal schließen und Kontakte neu laden
  closeModal();
  await loadContacts();
  displayContacts();
}








async function addContactToFirebase(contactData) {
  let BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
  try {
    let response = await fetch(BASE_URL + "contacts.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      throw new Error("Failed to set data to Firebase: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error setting data:", error);
    throw error;
  }
}


function makeContactsClickable() {
  contacts.forEach((contact) => {
      const contactElement = document.getElementById(`contact-${contact.id}`);

      if (contactElement) {
          contactElement.addEventListener("click", (event) => {
              event.preventDefault();
              showContactDetails(contact); // Show details and switch to the contact page
          });
      } else {
          console.warn(`No element found for contact with ID: ${contact.id}`);
      }
  });
}

function CreateSvg() {
  let logo = document.getElementById('contact-logo');

  logo.innerHTML += `
  <img class="svg-logo" src="../assets/img/img_contacts/contact_logo.svg">
  `;
}

function contactLogo(contact) {
  let logo = document.getElementById('contact-logo');

  logo.innerHTML = `
  <div class="profile-logo background-colors" style="background-color: ${contact.color};">
    ${contact.firstInitial}${contact.secondInitial}
  </div>
  `;
}

function showContactDetails(contact) {
  const contactDetailElement = document.getElementById("contact-detail-card");
  const contactPageElement = document.getElementById("contactPage");
  const backButtonElement = document.getElementById("back-button");

  // Escape quotes to prevent issues
  const contactJsonString = JSON.stringify(contact).replace(/"/g, '&quot;');

  contactDetailElement.innerHTML = `
  <div class="contact-card-main-infos">
      <div class="contact-detail-header">
          <div class="profile-content-big" style="background-color: ${contact.color}">
              ${contact.firstInitial}${contact.secondInitial}
          </div>
          <div class="contact-name-big">
              <h2>${contact.name}</h2>
          </div>
          <div class="contact-actions">
              <div class="contact-functions" onclick='openEditContactModal(${contactJsonString})'>
                  <img class="contact-functions-icons" src="/assets/img/img_contacts/edit.png" alt="">Edit
              </div>
              <div class="contact-functions" onclick="deleteContact('${contact.id}')">
                  <img class="contact-functions-icons" src="/assets/img/img_contacts/delete.png" alt="">Delete
              </div>
          </div>
          <div class="contact-card-subtitle">Contact Information</div>
          <div class="contact-card-details">
              <div class="contact-card-info">
                  <div class="contact-method">Email</div>
                  <div class="contact-email">
                      <a href="mailto:${contact.email}">${contact.email}</a>
                  </div>
              </div>
              <div class="contact-card-info">
                  <div class="contact-method">Phone</div>
                  <div class="contact-phone">
                      <p>${contact.phone}</p>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `;

  // Im mobilen Modus die Contact Page anzeigen
  if (window.innerWidth <= 800) {
      document.querySelector('.contacts-frame').style.display = 'none';
      contactPageElement.style.display = 'block';
      backButtonElement.style.display = 'block';
  }
}

// Funktion zum Zurückgehen zur Kontaktliste
function showContactList() {
  const contactPageElement = document.getElementById("contactPage");
  const backButtonElement = document.getElementById("back-button");

  document.querySelector('.contacts-frame').style.display = 'block';
  contactPageElement.style.display = 'none';
  backButtonElement.style.display = 'none';
}

// Event-Listener für den Zurück-Button
document.getElementById("back-button").addEventListener('click', showContactList);

document.getElementById("submit-button").addEventListener("click", function (event) {
  const contactEmail = document.getElementById("email-input").value;
  
  // Entferne vorherige Fehleranzeige
  document.getElementById("email-input").classList.remove("input-error");

  if (!isValidEmail(contactEmail)) {
      document.getElementById("email-input").classList.add("input-error");
      event.preventDefault(); // Verhindere das Absenden
      return;
  }

  // Wenn die E-Mail gültig ist, lasse das Formular abschicken
});


function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(de|com)$/;
  return emailPattern.test(email);
}


function openAddContactModal() {
  CreateSvg();

  // Clear the input fields for adding a new contact
  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";

  // Passe den Submit-Button für den Hinzufügen-Modus an
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Create contact";

  // Füge den Eventlistener hinzu, wenn das Formular abgeschickt wird
  submitButton.addEventListener('click', submitContact);

  // Open the modal for adding a new contact
  document.getElementById("contact-modal").style.display = "block";
}



async function updateContactInFirebase(contactId, updatedContactData) {
  try {
    let response = await fetch(`${BASE_URL}contacts/${contactId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContactData),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating contact:', error);
    return null;
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  await init();
  makeContactsClickable();
});

document.getElementById("add-contact-button").onclick = openModal;
document.getElementById("cancel-button").onclick = closeModal;
document.getElementById("close-modal-button").onclick = closeModal;

async function deleteContactFromFirebase(contactId) {
  try {
    let response = await fetch(`${BASE_URL}contacts/${contactId}.json`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting contact:', error);
    return null;
  }
}

let selectedContact = null;

    function makeContactsClickable() {
      contacts.forEach((contact) => {
        const contactElement = document.getElementById(`contact-${contact.id}`);

        if (contactElement) {
          contactElement.addEventListener("click", (event) => {
            event.preventDefault();
            
            // Wenn bereits ein Kontakt ausgewählt wurde, entferne die Markierung
            if (selectedContact) {
              selectedContact.classList.remove("selected");
            }

            // Markiere das aktuell geklickte Element
            contactElement.classList.add("selected");

            // Speichere das aktuell ausgewählte Element
            selectedContact = contactElement;

            // Optionale Funktion zum Anzeigen der Kontaktdetails
            showContactDetails(contact);
          });
        } else {
          console.warn(`No element found for contact with ID: ${contact.id}`);
        }
      });
    }