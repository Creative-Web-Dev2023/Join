let BASE_URL =
  "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
let namesFirstLetters = [];
let contacts = [];

/**
 * Initializes the application by loading contacts and displaying them.
 *
 * @async
 */
async function init() {
  await loadContacts();
  displayContacts();
}

/**
 * Loads contacts from Firebase, processes the data, and sorts the contacts and initials.
 *
 * @async
 */
async function loadContacts() {
  let contactsData = await getDataFromFirebase("contacts");
  if (!contactsData) {
    console.error("No data returned from Firebase.");
    return;
  }
  contacts = [];
  namesFirstLetters = [];
  processContactsData(contactsData);
  sortContactsAndInitials();
}

/**
 * Processes the contact data retrieved from Firebase.
 *
 * @param {Object} contactsData - The contact data object retrieved from Firebase.
 */
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

/**
 * Adds a contact to the list and updates the initials array.
 *
 * @param {string} key - The key of the contact in Firebase.
 * @param {Object} singleContact - The contact data object.
 */
function addContactToList(key, singleContact) {
  let contact = createContactObject(key, singleContact);
  contacts.push(contact);
  updateInitials(contact.firstInitial);
}

/**
 * Creates a contact object based on contact data.
 *
 * @param {string} key - The key of the contact in Firebase.
 * @param {Object} singleContact - The contact data object.
 * @return {Object} - The created contact object.
 */
function createContactObject(key, singleContact) {
  return {
    id: key,
    name: singleContact.name,
    email: singleContact.email,
    phone: singleContact.phone,
    emblem: singleContact.emblem,
    color: singleContact.color,
    firstInitial: singleContact.name.charAt(0).toUpperCase(),
    secondInitial:
      singleContact.name.split(" ")[1]?.charAt(0).toUpperCase() || "",
  };
}

/**
 * Updates the initials array if a new initial is found.
 *
 * @param {string} firstInitial - The first initial of the contact's name.
 */
function updateInitials(firstInitial) {
  if (!namesFirstLetters.includes(firstInitial)) {
    namesFirstLetters.push(firstInitial);
  }
}

/**
 * Sorts the contacts by their initials and sorts the initials array.
 */
function sortContactsAndInitials() {
  contacts.sort((a, b) => a.firstInitial.localeCompare(b.firstInitial));
  namesFirstLetters.sort();
}

/**
 * Displays the contacts in the UI, grouped by their initials.
 */
function displayContacts() {
  const contactListElement = document.getElementById("contact-list");
  contactListElement.innerHTML = "";
  namesFirstLetters.forEach((letter) => {
    contactListElement.innerHTML += `
            <div class="contacts-alphabet">${letter}</div>
            <div class="separator"></div>
            <div id="${letter}-content"></div>
        `;
  });
  contacts.forEach((contact) => {
    const initial = contact.firstInitial;
    const contentElement = document.getElementById(`${initial}-content`);
    if (contentElement) {
      contentElement.innerHTML += renderContactsHtml(contact);
    }
  });
  makeContactsClickable();
}

/**
 * Renders the HTML for a single contact entry.
 *
 * @param {Object} contact - The contact data object.
 * @return {string} - The generated HTML string for the contact.
 */
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

/**
 * Deletes a contact from Firebase and refreshes the contact list.
 *
 * @async
 * @param {string} contactId - The ID of the contact to delete.
 */
async function deleteThis(contactId) {
  await deleteContactFromFirebase(contactId);

  await loadContacts();
  displayContacts();
}

/**
 * Opens the contact edit modal for a specific contact.
 *
 * @param {string} contactId - The ID of the contact to edit.
 */
function editThis(contactId) {
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) {
    console.error("Contact not found for editing.");
    return;
  }

  openEditContactModal(contact);
}

/**
 * Fetches data from Firebase for a specified path.
 *
 * @async
 * @param {string} [path=""] - The Firebase path to fetch data from.
 * @return {Promise<Object>} - The data retrieved from Firebase.
 */
async function getDataFromFirebase(path = "") {
  try {
    let response = await fetch(BASE_URL + path + ".json");
    if (!response.ok) {
      console.error("Failed to fetch data from Firebase:", response.statusText);
      return {};
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
}

/**
 * Sets data to Firebase for a specified path.
 *
 * @async
 * @param {string} [path=""] - The Firebase path to set data to.
 * @param {Object} data - The data to be saved in Firebase.
 * @return {Promise<Object>} - The response from Firebase.
 */
async function setDataToFirebase(path = "", data = {}) {
  try {
    let response = await fetch(BASE_URL + path + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

/**
 * Generates a random color in hex format.
 *
 * @return {string} - The generated hex color code.
 */
function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Generates an emblem from the initials of a name.
 *
 * @param {string} name - The name of the contact.
 * @return {string} - The generated emblem from the initials of the contact.
 */
function generateEmblem(name) {
  const nameParts = name.trim().split(" ");
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const secondInitial =
    nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
  return firstInitial + secondInitial;
}
/**
 * Adds a new contact by gathering data, validating it, saving it to Firebase, refreshing the contact list, and clearing the form.
 *
 * @async
 */
async function addContact() {
  const contactData = gatherContactData();
  if (!isValidContact(contactData)) return;

  await saveContactToFirebase(contactData);
  await refreshContacts();
  clearContactForm();
}

/**
 * Gathers contact data from the input fields in the form.
 *
 * @return {Object} - An object containing the name, email, phone, color, and emblem for the contact.
 */
function gatherContactData() {
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    color: generateRandomColor(),
    emblem: generateEmblem(document.getElementById("name").value),
  };
}

/**
 * Validates the contact data to ensure both name and email are present.
 *
 * @param {Object} contactData - The contact data object to validate.
 * @return {boolean} - True if the contact data is valid, false otherwise.
 */
function isValidContact(contactData) {
  return contactData.name && contactData.email;
}

/**
 * Saves the contact data to Firebase.
 *
 * @async
 * @param {Object} contactData - The contact data to save to Firebase.
 */
async function saveContactToFirebase(contactData) {
  await setDataToFirebase("contacts", contactData);
}

/**
 * Reloads and displays the contact list after a contact has been added or modified.
 *
 * @async
 */
async function refreshContacts() {
  await loadContacts();
  displayContacts();
}

/**
 * Clears the contact form by resetting the input fields.
 */
function clearContactForm() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
}

/**
 * Deletes a contact from Firebase by its ID and refreshes the page.
 *
 * @async
 * @param {string} contactId - The ID of the contact to delete.
 * @return {Promise<Object>} - The response from Firebase after deletion.
 */
async function deleteContact(contactId) {
  try {
    let response = await fetch(BASE_URL + "contacts/" + contactId + ".json", {
      method: "DELETE",
    });
    if (!response.ok) {
      console.error("Failed to delete data in Firebase:", response.statusText);
      return {};
    }
    location.reload();
    return await response.json();
  } catch (error) {
    console.error("Error deleting data:", error);
    return {};
  }
}
