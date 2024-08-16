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

  submitButton.addEventListener("click", function updateContact(event) {
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
 * Prepares the edit modal by populating the contact data and adjusting the display for editing.
 *
 * @param {Object} contact - The contact data to populate in the form.
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
 * Configures the submit button for updating a contact and validates the form.
 *
 * @param {Object} contact - The contact being updated.
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
 * Closes the contact modal.
 */
function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
  window.location.href = "/html/contacts.html";
}

/**
 * Validates the form inputs for correctness.
 *
 * @return {boolean} - Returns true if the form is valid, otherwise false.
 */
function validateForm() {
  clearInputErrors();
  const contactData = gatherContactInputData2();
  return validateContactData(contactData);
}

/**
 * Gathers the contact data from the form input fields.
 *
 * @return {Object} - The contact data from the form.
 */
function gatherContactInputData2() {
  return {
    name: document.getElementById("name-input").value.trim(),
    email: document.getElementById("email-input").value.trim(),
    phone: document.getElementById("phone-input").value.trim(),
  };
}

/**
 * Submits a new contact to Firebase, validates the form, and refreshes the contact list.
 *
 * @async
 * @param {Event} event - The submit event.
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
 * Clears any input errors from the form fields.
 */
function clearInputErrors() {
  document.getElementById("name-input").classList.remove("input-error");
  document.getElementById("email-input").classList.remove("input-error");
  document.getElementById("phone-input").classList.remove("input-error");
}

/**
 * Validates the contact data to ensure required fields are filled out correctly.
 *
 * @param {Object} contactData - The contact data to validate.
 * @return {boolean} - Returns true if the contact data is valid, otherwise false.
 */
function validateContactData(contactData) {
  let isValid = true;

  if (!contactData.name) {
    document.getElementById("name-input").classList.add("input-error");
    isValid = false;
  }

  if (!contactData.email || !isValidEmail(contactData.email)) {
    document.getElementById("email-input").classList.add("input-error");
    isValid = false;
  }

  if (!contactData.phone || !isValidPhoneNumber(contactData.phone)) {
    document.getElementById("phone-input").classList.add("input-error");
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
 * Resets the contact form to its default state.
 */
function resetContactForm() {
  document.getElementById("name-input").value = "";
  document.getElementById("email-input").value = "";
  document.getElementById("phone-input").value = "";
}

/**
 * Refreshes the contact list by reloading the contacts and displaying them.
 *
 * @async
 */
async function refreshContacts() {
  await loadContacts();
  displayContacts();
}
