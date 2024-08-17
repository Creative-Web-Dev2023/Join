/**
 * Opens the contact modal for creating or editing a contact.
 *
 * @param {boolean} [isEditMode=false] - Determines whether the modal is in edit mode.
 * @param {Object|null} [contact=null] - The contact to be edited if in edit mode.
 */
function openModal(isEditMode = false, contact = null) {
  CreateSvg();
  resetSubmitButton();
  if (isEditMode && contact) {
    populateEditMode(contact);
    configureSubmitButtonForUpdate(contact);
  } else {
    resetForm();
    configureSubmitButtonForCreate();
  }
  showContactModal();
}

/**
 * Resets the submit button by removing any previously attached event listeners.
 */
function resetSubmitButton() {
  const submitButton = document.getElementById("submit-button");
  submitButton.removeEventListener("click", submitContact);
  submitButton.removeEventListener("click", updateContact);
}

/**
 * Populates the contact form with the provided contact's data for editing.
 *
 * @param {Object} contact - The contact data to populate in the form.
 */
function populateEditMode(contact) {
  document.getElementById("name-input").value = contact.name;
  document.getElementById("email-input").value = contact.email;
  document.getElementById("phone-input").value = contact.phone;
  document.getElementById("contactEdit").style.display = "block";
  document.getElementById("contactAdd").style.display = "none";
}

/**
 * Configures the submit button for updating a contact.
 *
 * @param {Object} contact - The contact being updated.
 */
function configureSubmitButtonForUpdate(contact) {
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Update contact";
  submitButton.addEventListener("click", function (event) {
    event.preventDefault();
    const updatedContactData = gatherUpdatedContactData(contact);
    updateContactInFirebase(contact.id, updatedContactData).then(() => {
      closeModal();
      loadContacts().then(displayContacts);
    });
  });
}

/**
 * Resets the contact form to default state for adding a new contact.
 */
function resetForm() {
  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";
  document.getElementById("contactEdit").style.display = "none";
  document.getElementById("contactAdd").style.display = "block";
}

/**
 * Configures the submit button for creating a new contact.
 */
function configureSubmitButtonForCreate() {
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Create contact";
  submitButton.addEventListener("click", submitContact);
}

/**
 * Gathers the updated contact data from the form.
 *
 * @param {Object} contact - The original contact data.
 * @return {Object} - The updated contact data.
 */
function gatherUpdatedContactData(contact) {
  return {
    name: document.getElementById("name-input").value,
    email: document.getElementById("email-input").value,
    phone: document.getElementById("phone-input").value,
    color: contact.color || generateRandomColor(),
    emblem: generateEmblem(document.getElementById("name-input").value),
  };
}

/**
 * Displays the contact modal.
 */
function showContactModal() {
  document.getElementById("contact-modal").style.display = "block";
}

/**
 * Handles the contact update by sending the updated data to Firebase.
 *
 * @async
 * @param {Event} event - The event triggered by the submit button.
 */
async function updateContact(event) {
  event.preventDefault();
  let updatedContactData = {
    name: document.getElementById("name-input").value,
    email: document.getElementById("email-input").value,
    phone: document.getElementById("phone-input").value,
    color: contact.color || generateRandomColor(),
    emblem: generateEmblem(document.getElementById("name-input").value),
  };
  await updateContactInFirebase(contact.id, updatedContactData);
  closeModal();
  await loadContacts();
  displayContacts();
}

/**
 * Opens the edit modal for a contact, populates the form, and configures the submit button for updating.
 *
 * @param {Object} contact - The contact to be edited.
 */
function openEditContactModal(contact) {
  prepareEditModal(contact);
  configureSubmitButton(contact);
  showEditContactModal();
}
/**
 * Prepares the contact modal for editing by populating the form fields with the contact's data.
 *
 * @param {Object} contact - The contact data to be edited.
 */
function prepareEditModal(contact) {
  contactLogo(contact);
  document.getElementById("name-input").value = contact.name;
  document.getElementById("email-input").value = contact.email;
  document.getElementById("phone-input").value = contact.phone;
  document.getElementById("contactEdit").style.display = "block";
  document.getElementById("contactAdd").style.display = "none";
  document.getElementById("contactAddSmall").style.display = "none";
}

/**
 * Configures the submit button to update the contact when clicked.
 *
 * @param {Object} contact - The contact to be updated.
 */
function configureSubmitButton(contact) {
  const submitButton = document.getElementById("submit-button");
  submitButton.removeEventListener("click", submitContact);
  submitButton.removeEventListener("click", updateContact);
  submitButton.textContent = "Update contact";

  submitButton.addEventListener("click", async function (event) {
    event.preventDefault();
    if (!validateForm()) return;

    const updatedContactData = gatherUpdatedContactData(contact);
    await updateContactInFirebase(contact.id, updatedContactData);
    closeModal();
    await refreshContacts();
  });
}

/**
 * Gathers the updated contact data from the form fields.
 *
 * @param {Object} contact - The original contact data.
 * @return {Object} - The updated contact data.
 */
function gatherUpdatedContactData(contact) {
  return {
    name: document.getElementById("name-input").value,
    email: document.getElementById("email-input").value,
    phone: document.getElementById("phone-input").value,
    color: contact.color || generateRandomColor(),
    emblem: generateEmblem(document.getElementById("name-input").value),
  };
}

/**
 * Displays the edit contact modal by setting its display property to "block".
 */
function showEditContactModal() {
  document.getElementById("contact-modal").style.display = "block";
}

/**
 * Refreshes the contact list by loading contacts from Firebase and displaying them.
 */
async function refreshContacts() {
  await loadContacts();
  displayContacts();
}

/**
 * Closes the contact modal by hiding it.
 */
function closeModal2() {
  document.getElementById("contact-modal").style.display = "none";
}

/**
 * Closes the contact modal and redirects to the contacts page.
 */
function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
  window.location.href = "/html/contacts.html";
}

/**
 * Validates a phone number by matching it against a regex pattern.
 *
 * @param {string} phone - The phone number to validate.
 * @return {boolean} - Returns true if the phone number is valid, otherwise false.
 */
function isValidPhoneNumber(phone) {
  const phonePattern = /^[0-9+\s-()]+$/;
  return phonePattern.test(phone);
}

/**
 * Validates the form inputs for correctness and completeness.
 *
 * @return {boolean} - Returns true if the form is valid, otherwise false.
 */
function validateForm() {
  clearInputErrors();
  const contactData = gatherContactInputData2();
  return validateContactData(contactData);
}

/**
 * Gathers contact data from the form fields.
 *
 * @return {Object} - The contact data from the form fields.
 */
function gatherContactInputData2() {
  return {
    name: document.getElementById("name-input").value.trim(),
    email: document.getElementById("email-input").value.trim(),
    phone: document.getElementById("phone-input").value.trim(),
  };
}

/**
 * Submits a new contact to Firebase after validation, and refreshes the contact list.
 *
 * @async
 * @param {Event} event - The event triggered by the form submission.
 */
async function submitContact(event) {
  event.preventDefault();
  clearInputErrors();
  const contactData = gatherContactInputData();
  const isValid = validateContactData(contactData);
  if (!isValid) return;
  await saveContact(contactData);
  resetContactForm();
  closeModal();
  await refreshContacts();
}

/**
 * Gathers contact data from the form fields for creating a new contact.
 *
 * @return {Object} - The contact data from the form fields.
 */
function gatherContactInputData() {
  return {
    name: document.getElementById("name-input").value.trim(),
    email: document.getElementById("email-input").value.trim(),
    phone: document.getElementById("phone-input").value.trim(),
    color: generateRandomColor(),
    emblem: generateEmblem(document.getElementById("name-input").value.trim()),
  };
}

/**
 * Clears any input error classes from the form fields.
 */
function clearInputErrors() {
  document.getElementById("name-input").classList.remove("input-error");
  document.getElementById("email-input").classList.remove("input-error");
  document.getElementById("phone-input").classList.remove("input-error");
}

/**
 * Validates the contact data to ensure all required fields are correctly filled out.
 *
 * @param {Object} contactData - The contact data to validate.
 * @return {boolean} - Returns true if the contact data is valid, otherwise false.
 */
function validateContactData(contactData) {
  let isValid = true;
  let dataError1 = document.getElementById('error-when-edit1');
  let dataError2 = document.getElementById('error-when-edit2');
  let dataError3 = document.getElementById('error-when-edit3');
  if (!contactData.name) {
    document.getElementById("name-input").classList.add("input-error");
    dataError1.style.display = "block";
    isValid = false;
  }
  if (!contactData.email || !isValidEmail(contactData.email)) {
    document.getElementById("email-input").classList.add("input-error");
    dataError2.style.display = "block";
    isValid = false;
  }
  if (!contactData.phone || !isValidPhoneNumber(contactData.phone)) {
    document.getElementById("phone-input").classList.add("input-error");
    dataError3.style.display = "block";
    isValid = false;
  }
  return isValid;
}

/**
 * Saves a new contact to Firebase.
 *
 * @async
 * @param {Object} contactData - The contact data to be saved.
 */
async function saveContact(contactData) {
  await addContactToFirebase(contactData);
}

/**
 * Resets the contact form fields to their default values.
 */
function resetContactForm() {
  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";
}
