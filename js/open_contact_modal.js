let selectedContact = null;

/**
 * Adds a new contact to Firebase.
 * 
 * @async
 * @param {Object} contactData - The contact data to be saved to Firebase.
 * @return {Promise<Object>} - The response from Firebase after the contact is saved.
 * @throws {Error} - Throws an error if the request to Firebase fails.
 */
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
        throw new Error("Failed to set data to Firebase: " + response.statusText);
      }
      return await response.json();
    } catch (error) {
      console.error("Error setting data:", error);
      throw error;
    }
  }
  
  /**
   * Attaches click event listeners to all contact elements, making them clickable and showing their details.
   */
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
  
  /**
   * Creates and inserts the SVG logo into the contact logo element.
   */
  function CreateSvg() {
    let logo = document.getElementById("contact-logo");
  
    logo.innerHTML = `
      <img class="svg-logo" src="../assets/img/img_contacts/contact_logo.svg">
    `;
  }
  
  /**
   * Displays the contact logo with initials and background color.
   * 
   * @param {Object} contact - The contact object containing initials and background color.
   */
  function contactLogo(contact) {
    let logo = document.getElementById("contact-logo");
  
    logo.innerHTML = `
      <div class="profile-logo background-colors" style="background-color: ${contact.color};">
        ${contact.firstInitial}${contact.secondInitial}
      </div>
    `;
  }
  
  /**
   * Shows detailed information of the selected contact, and switches to the detailed view on smaller screens.
   * 
   * @param {Object} contact - The contact object containing contact details.
   */
  function showContactDetails(contact) {
    const contactDetailElement = document.getElementById("contact-detail-card");
    const contactPageElement = document.getElementById("contactPage");
    const backButtonElement = document.getElementById("back-button");
    const contactJsonString = JSON.stringify(contact).replace(/"/g, "&quot;");
    contactDetailElement.innerHTML = HTMLContactDetail(contact, contactJsonString);
    if (window.innerWidth <= 800) {
      document.querySelector(".contacts-frame").style.display = "none";
      contactPageElement.style.display = "block";
      backButtonElement.style.display = "block";
    }
  }
  
  /**
   * Switches back to the contact list view from the detailed view on smaller screens.
   */
  function showContactList() {
    const contactPageElement = document.getElementById("contactPage");
    const backButtonElement = document.getElementById("back-button");
  
    document.querySelector(".contacts-frame").style.display = "block";
    contactPageElement.style.display = "none";
    backButtonElement.style.display = "none";
  }
  
  /**
   * Toggles the visibility of the mini actions menu for editing and deleting contacts.
   * 
   * @param {HTMLElement} element - The element triggering the toggle.
   */
  function toggleMiniReg(element) {
    const miniReg = document.getElementById(`miniReg`);
  
    if (miniReg.style.display === "none" || miniReg.style.display === "") {
      miniReg.style.display = "block";
    } else {
      miniReg.style.display = "none";
    }
  }
  
  /**
   * Validates an email address against a specific pattern (supports .de and .com domains).
   * 
   * @param {string} email - The email address to validate.
   * @return {boolean} - Returns true if the email is valid, false otherwise.
   */
  function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(de|com)$/;
    return emailPattern.test(email);
  }
  
  /**
   * Opens the modal for adding a new contact and resets the input fields.
   */
  function openAddContactModal() {
    CreateSvg();
    document.getElementById("name-input").value = "";
    document.getElementById("email-input").value = "";
    document.getElementById("phone-input").value = "";
    const submitButton = document.getElementById("submit-button");
    submitButton.textContent = "Create contact";
    submitButton.addEventListener("click", submitContact);
    document.getElementById("contact-modal").style.display = "block";
  }
  
  /**
   * Updates an existing contact in Firebase using the provided contact ID and data.
   * 
   * @async
   * @param {string} contactId - The ID of the contact to update.
   * @param {Object} updatedContactData - The updated contact data.
   * @return {Promise<Object|null>} - Returns the response from Firebase, or null in case of error.
   */
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
        throw new Error("Network response was not ok");
      }
      return response.json();
    } catch (error) {
      console.error("Error updating contact:", error);
      return null;
    }
  }
  
  /**
   * Deletes a contact from Firebase using the provided contact ID.
   * 
   * @async
   * @param {string} contactId - The ID of the contact to delete.
   * @return {Promise<Object|null>} - Returns the response from Firebase, or null in case of error.
   */
  async function deleteContactFromFirebase(contactId) {
    try {
      let response = await fetch(`${BASE_URL}contacts/${contactId}.json`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting contact:", error);
      return null;
    }
  }
  
  /**
   * Attaches click event listeners to the contact elements, making them selectable and displaying their details.
   */
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
  
  /**
   * Event listener for the back button, which switches back to the contact list view.
   */
  document
    .getElementById("back-button")
    .addEventListener("click", showContactList);
  
  /**
   * Event listener for the form submission button, which validates the email before allowing submission.
   */
  document
    .getElementById("submit-button")
    .addEventListener("click", function (event) {
      const contactEmail = document.getElementById("email-input").value;
      document.getElementById("email-input").classList.remove("input-error");
      if (!isValidEmail(contactEmail)) {
        document.getElementById("email-input").classList.add("input-error");
        event.preventDefault();
        return;
      }
    });
  
  /**
   * Event listeners for the modal buttons, opening and closing the contact modal.
   */
  document.getElementById("add-contact-button").onclick = openModal;
  document.getElementById("cancel-button").onclick = closeModal;
  document.getElementById("close-modal-button").onclick = closeModal;
  
  /**
   * Initializes the app, loads contacts, and makes them clickable once the DOM is fully loaded.
   */
  document.addEventListener("DOMContentLoaded", async () => {
    await init();
    makeContactsClickable();
  });
  