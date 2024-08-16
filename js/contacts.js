function openModal(isEditMode = false, contact = null) {
  CreateSvg();

  const submitButton = document.getElementById("submit-button");


  submitButton.removeEventListener('click', submitContact);
  submitButton.removeEventListener('click', updateContact);

  if (isEditMode && contact) {

    document.getElementById("name-input").value = contact.name;
    document.getElementById("email-input").value = contact.email;
    document.getElementById("phone-input").value = contact.phone;


    document.getElementById('contactEdit').style.display = 'block';
    document.getElementById('contactAdd').style.display = 'none';

    submitButton.textContent = "Update contact";


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

    document.getElementById("name-input").value = "";
    document.getElementById("email-input").value = "";
    document.getElementById("phone-input").value = "";


    document.getElementById('contactEdit').style.display = 'none';
    document.getElementById('contactAdd').style.display = 'block';

    submitButton.textContent = "Create contact";


    submitButton.addEventListener('click', submitContact);
  }


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


  submitButton.removeEventListener('click', submitContact);
  submitButton.removeEventListener('click', updateContact);


  document.getElementById("name-input").value = contact.name;
  document.getElementById("email-input").value = contact.email;
  document.getElementById("phone-input").value = contact.phone;


  document.getElementById('contactEdit').style.display = 'block';
  document.getElementById('contactAdd').style.display = 'none';
  document.getElementById('contactAddSmall').style.display = 'none';

  submitButton.textContent = "Update contact";


  submitButton.addEventListener('click', async function (event) {
    event.preventDefault();


    if (!validateForm()) {
      return;
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


  document.getElementById("contact-modal").style.display = "block";
}

function validateForm() {
  let isValid = true;

  const contactName = document.getElementById("name-input").value;
  const contactEmail = document.getElementById("email-input").value;
  const contactPhone = document.getElementById("phone-input").value;


  document.getElementById("name-input").classList.remove("input-error");
  document.getElementById("email-input").classList.remove("input-error");
  document.getElementById("phone-input").classList.remove("input-error");


  if (!contactName) {
    document.getElementById("name-input").classList.add("input-error");
    isValid = false;
  }


  if (!contactEmail || !isValidEmail(contactEmail)) {
    document.getElementById("email-input").classList.add("input-error");
    isValid = false;
  }


  if (!contactPhone || !isValidPhoneNumber(contactPhone)) {
    document.getElementById("phone-input").classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

function closeModal2() {
  document.getElementById("contact-modal").style.display = "none";
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
  event.preventDefault();

  let contactName = document.getElementById("name-input").value;
  let contactEmail = document.getElementById("email-input").value;
  let contactPhone = document.getElementById("phone-input").value;


  document.getElementById("name-input").classList.remove("input-error");
  document.getElementById("email-input").classList.remove("input-error");
  document.getElementById("phone-input").classList.remove("input-error");

  let isValid = true;


  if (!contactName) {
    document.getElementById("name-input").classList.add("input-error");
    isValid = false;
  }


  if (!contactEmail || !isValidEmail(contactEmail)) {
    document.getElementById("email-input").classList.add("input-error");
    isValid = false;
  }


  if (!contactPhone || !isValidPhoneNumber(contactPhone)) {
    document.getElementById("phone-input").classList.add("input-error");
    isValid = false;
  }


  if (!isValid) {
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
        showContactDetails(contact);
      });
    }
  });
}

function CreateSvg() {
  let logo = document.getElementById('contact-logo');

  logo.innerHTML = `
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
          <div class="contact-actions" id="contact-actions">
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
      <div class="edit_contact" id="editContact" onclick="toggleMiniReg()">
        <img class="hoverr" src="/assets/img/img_contacts/edit_contact.png" alt="">
        <div class="miniReg" id="miniReg" style="display: none;">
            <img class="edit_hoverr" src="/assets/img/img_contacts/mini_edit.png" onclick="openEditContactModal(${contactJsonString})" alt="">
            <img class="delete_hoverr" src="/assets/img/img_contacts/mini_delete.png" onclick="deleteContact('${contact.id}')" alt="">
      </div>          
    </div>
  </div>

  `;


  if (window.innerWidth <= 800) {
    document.querySelector('.contacts-frame').style.display = 'none';
    contactPageElement.style.display = 'block';
    backButtonElement.style.display = 'block';
  }
}


function showContactList() {
  const contactPageElement = document.getElementById("contactPage");
  const backButtonElement = document.getElementById("back-button");

  document.querySelector('.contacts-frame').style.display = 'block';
  contactPageElement.style.display = 'none';
  backButtonElement.style.display = 'none';
}

function toggleMiniReg(element) {
  const miniReg = document.getElementById(`miniReg`);

  if (miniReg.style.display === "none" || miniReg.style.display === "") {
    miniReg.style.display = "block";
  } else {
    miniReg.style.display = "none";
  }
}



document.getElementById("back-button").addEventListener('click', showContactList);

document.getElementById("submit-button").addEventListener("click", function (event) {
  const contactEmail = document.getElementById("email-input").value;


  document.getElementById("email-input").classList.remove("input-error");

  if (!isValidEmail(contactEmail)) {
    document.getElementById("email-input").classList.add("input-error");
    event.preventDefault();
    return;
  }


});


function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(de|com)$/;
  return emailPattern.test(email);
}


function openAddContactModal() {
  CreateSvg();


  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";


  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Create contact";


  submitButton.addEventListener('click', submitContact);


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


        if (selectedContact) {
          selectedContact.classList.remove("selected");
        }


        contactElement.classList.add("selected");


        selectedContact = contactElement;


        showContactDetails(contact);
      });
    }
  });
}