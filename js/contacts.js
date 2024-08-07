function openModal() {
  document.getElementById("contact-modal").style.display = "block";
}

function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
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
        showContactDetails(contact);
      });
    } else {
      console.warn(`No element found for contact with ID: ${contact.id}`);
    }
  });
}

function showContactDetails(contact) {
  const contactDetailElement = document.getElementById("contact-detail-card");
  contactDetailElement.innerHTML = `
        <div class="contact-detail-header">
            <div class="profile-content-big" style="background-color: ${contact.color}">
                ${contact.firstInitial}${contact.secondInitial}
            </div>
            <div class="contact-name">
                <h2>${contact.name}</h2>
            </div>
             <div class="contact-actions">
           <div class="contact-functions" onclick="openEditContactModal(${contact})">
              <img class="contactFunctionsIcons" src="../assets/img/img_contacts/delete.png" alt="">Edit
           </div>
      <div class="contactFunctions" onclick="deleteContact(${contact})">
        <img class="contactFunctionsIcons" src="../assets/img/img_contacts/edit.png" alt="">Delete
      </div>
 </div>
 </div>
        </div>
        <div class="contact-info">
    <p>Email: <span>${contact.email}</span></p>
    <p>Telefon: ${contact.phone}</p>
</div>
     
    `;
  document.getElementById("edit-contact-button").onclick = () =>
    openEditContactModal(contact);
  document.getElementById("delete-contact-button").onclick = () =>
    deleteContact(contact.id);
}

function openEditContactModal(contact) {
  document.getElementById("name-input").value = contact.name;
  document.getElementById("email-input").value = contact.email;
  document.getElementById("phone-input").value = contact.phone;

  // Setze den Button, um die aktualisierten Daten zu speichern
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Update contact";
  submitButton.onclick = async function () {
    let updatedContactData = {
      name: document.getElementById("name-input").value,
      email: document.getElementById("email-input").value,
      phone: document.getElementById("phone-input").value,
    };

    await updateContactInFirebase(contact.id, updatedContactData);
    closeModal();
    await loadContacts();
    displayContacts();
  };
  openModal();
}

async function deleteContact(contactId) {
  if (confirm("Do you really want to delete this contact?")) {
    let success = await deleteContactFromFirebase(contactId);
    if (success) {
      await loadContacts();
      displayContacts();
    }
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  await init();
  makeContactsClickable();
});

document.getElementById("add-contact-button").onclick = openModal;
document.getElementById("cancel-button").onclick = closeModal;
document.getElementById("submit-button").onclick = submitContact;
document.getElementById("close-modal-button").onclick = closeModal;
