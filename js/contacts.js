function openModal(isEditMode = false, contact = null) {
  if (isEditMode && contact) {
    CreateSvg();
    // Populate fields with the contact's data for editing
    document.getElementById("name-input").value = contact.name;
    document.getElementById("email-input").value = contact.email;
    document.getElementById("phone-input").value = contact.phone;

    const submitButton = document.getElementById("submit-button");
    submitButton.textContent = "Update contact";
    submitButton.onclick = async function () {
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
    };
  } else {
    // Clear the input fields for adding a new contact
    document.getElementById("name-input").value = "";
    document.getElementById("email-input").value = "";
    document.getElementById("phone-input").value = "";

    const submitButton = document.getElementById("submit-button");
    submitButton.textContent = "Create contact";
    submitButton.onclick = submitContact;
  }

  document.getElementById("contact-modal").style.display = "block";
}


function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
  window.location.href = '/html/contacts.html';
}

async function submitContact() {
  let contactName = document.getElementById("name-input").value;
  let contactEmail = document.getElementById("email-input").value;
  let contactPhone = document.getElementById("phone-input").value;

  if (!contactName || !contactEmail || !contactPhone) {
    alert("Please fill out all required fields.");
    return;
  }

  let contactData = {
    name: contactName,
    email: contactEmail,
    phone: contactPhone,
    color: generateRandomColor(),
    emblem: generateEmblem(contactName)
  };

  await addContactToFirebase(contactData);

  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";

  closeModal();
  await loadContacts();
  displayContacts();
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

function makeContactsClickable() {
  contacts.forEach((contact) => {
    const contactElement = document.getElementById(`contact-${contact.id}`);

    if (contactElement) {
      contactElement.addEventListener("click", (event) => {
        event.preventDefault();
        showContactDetails(contact); // Show details without opening the edit modal
      });
    } else {
      console.warn(`No element found for contact with ID: ${contact.id}`);
    }
  });
}

function CreateSvg() {
  let logo = document.getElementById('contact-logo');

  logo.innerHTML += `
  <img class="svg-logo" src="/assets/img/img_contacts/contact_logo.svg">
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
            <img class="contact-functions-icons" src="../assets/img/img_contacts/edit.png" alt="">Edit
          </div>
          <div class="contact-functions" onclick="deleteContact('${contact.id}')">
            <img class="contact-functions-icons" src="../assets/img/img_contacts/delete.png" alt="">Delete
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
}



function openEditContactModal(contact) {
  contactLogo(contact)
  // Populate fields with the contact's data for editing
  document.getElementById("name-input").value = contact.name;
  document.getElementById("email-input").value = contact.email;
  document.getElementById("phone-input").value = contact.phone;

  // Change the submit button text and functionality
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Update contact";
  submitButton.onclick = async function () {
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
  };

  // Open the modal for editing
  document.getElementById("contact-modal").style.display = "block";
}


function openAddContactModal() {
  CreateSvg();
  // Clear the input fields for adding a new contact
  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";

  // Change the submit button text and functionality
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Create contact";
  submitButton.onclick = submitContact;

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

async function deleteContact(contactId) {
  if (confirm("Do you really want to delete this contact?")) {
    let success = await deleteContactFromFirebase(contactId);
    location.reload();
    if (success) {
      await location.reload();
    }
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  await init();
  makeContactsClickable();
});

document.getElementById("add-contact-button").onclick = openAddContactModal;
document.getElementById("cancel-button").onclick = closeModal;
document.getElementById("submit-button").onclick = submitContact;
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