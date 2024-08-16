/**
 * Validates the passwords and privacy policy acceptance.
 *
 * @return {boolean} - True if the passwords match and the privacy policy is accepted, false otherwise.
 */
function validatePasswords() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const passwordError = document.getElementById("passwordError");
  const privacyPolicy = document.getElementById("privacyPolicy");
  resetError(passwordError);

  if (!arePasswordsMatching(password, confirmPassword, passwordError)) {
    return false;
  }

  if (!isPrivacyPolicyAccepted(privacyPolicy, passwordError)) {
    return false;
  }
  return true;
}

/**
 * Resets the display of the error element.
 *
 * @param {HTMLElement} errorElement - The element where the error message is displayed.
 */
function resetError(errorElement) {
  errorElement.style.display = "none";
}

/**
 * Checks if the passwords match.
 *
 * @param {string} password - The password entered by the user.
 * @param {string} confirmPassword - The password confirmation entered by the user.
 * @param {HTMLElement} errorElement - The element where the error message is displayed.
 * @return {boolean} - True if the passwords match, false otherwise.
 */
function arePasswordsMatching(password, confirmPassword, errorElement) {
  if (password === confirmPassword) {
    return true;
  }
  showError(errorElement, "Passwords do not match.");
  return false;
}

/**
 * Checks if the privacy policy is accepted.
 *
 * @param {HTMLElement} privacyPolicyCheckbox - The privacy policy checkbox element.
 * @param {HTMLElement} errorElement - The element where the error message is displayed.
 * @return {boolean} - True if the privacy policy is accepted, false otherwise.
 */
function isPrivacyPolicyAccepted(privacyPolicyCheckbox, errorElement) {
  if (privacyPolicyCheckbox.checked) {
    return true;
  }
  showError(errorElement, "Please accept the privacy policy.");
  return false;
}

/**
 * Displays an error message.
 *
 * @param {HTMLElement} errorElement - The element where the error message is displayed.
 * @param {string} message - The error message to display.
 */
function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

/**
 * Shows a success popup after form submission and redirects the user.
 */
function showSuccessPopup() {
  const successPopup = document.getElementById("successPopup");
  successPopup.style.display = "block";
  setTimeout(() => {
    successPopup.style.bottom = "50%";
  }, 0);
  setTimeout(() => {
    successPopup.style.display = "none";
    window.location.href = "/html/summary.html";
  }, 1500);
}

/**
 * Toggles the visibility of the password input field.
 *
 * @param {string} id - The ID of the password input field.
 */
function togglePasswordVisibility(id) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

/**
 * Handles form submission for contact data and sends it to Firebase.
 *
 * @async
 * @param {Event} event - The event object.
 */
async function submitContactFB(event) {
  clearErrorMessages();
  let { contactName, contactEmail, password } = getContactFormData();

  if (!isFormValid(contactName, contactEmail)) return;

  let contactData = prepareContactData(contactName, contactEmail, password);

  try {
    await addContactToFirebase(contactData);
    handleSuccessfulSubmission(contactName);
  } catch (error) {
    console.error("Failed to submit contact data:", error);
  }
}

/**
 * Clears error messages from the form.
 */
function clearErrorMessages() {
  document.getElementById("emailError").style.display = "none";
  document.getElementById("passwordError").style.display = "none";
}

/**
 * Retrieves contact form data.
 *
 * @return {Object} - An object containing the contact name, email, and password.
 */
function getContactFormData() {
  return {
    contactName: document.getElementById("fullName").value,
    contactEmail: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
}

/**
 * Validates the form inputs.
 *
 * @param {string} contactName - The name entered by the user.
 * @param {string} contactEmail - The email entered by the user.
 * @return {boolean} - True if the form is valid, false otherwise.
 */
function isFormValid(contactName, contactEmail) {
  let isValid = true;

  if (!validatePasswords()) isValid = false;

  if (!validateEmail(contactEmail)) {
    showError(
      "emailError",
      "Please enter a valid email address ending in .de or .com"
    );
    isValid = false;
  }

  if (!contactName || !contactEmail) isValid = false;

  return isValid;
}

/**
 * Prepares the contact data for submission.
 *
 * @param {string} contactName - The name entered by the user.
 * @param {string} contactEmail - The email entered by the user.
 * @param {string} password - The password entered by the user.
 * @return {Object} - An object containing the contact data.
 */
function prepareContactData(contactName, contactEmail, password) {
  return {
    name: contactName,
    email: contactEmail,
    color: generateRandomColor(),
    emblem: generateEmblem(contactName),
    password: password,
  };
}

/**
 * Handles the successful form submission, stores the user's name, and resets the form.
 *
 * @param {string} contactName - The name entered by the user.
 */
function handleSuccessfulSubmission(contactName) {
  localStorage.setItem("fullName", contactName);
  localStorage.setItem("isGuest", "false");
  showSuccessPopup();
  resetForm();
}

/**
 * Resets the form inputs.
 */
function resetForm() {
  document.getElementById("fullName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
}

/**
 * Checks if all required inputs are filled and enables or disables the sign-up button accordingly.
 */
document.addEventListener("DOMContentLoaded", function () {
  const signUpButton = document.getElementById("signUpButton");
  const inputs = document.querySelectorAll("#signupForm input[required]");
  const privacyPolicy = document.getElementById("privacyPolicy");

  function checkInputs() {
    const allFilled = areInputsFilled(inputs);
    signUpButton.disabled = !(allFilled && privacyPolicy.checked);
  }

  inputs.forEach((input) => input.addEventListener("input", checkInputs));

  privacyPolicy.addEventListener("change", checkInputs);
  checkInputs();
});

/**
 * Checks if all required inputs are filled.
 *
 * @param {NodeList} inputs - A NodeList of required input elements.
 * @return {boolean} - True if all inputs are filled, false otherwise.
 */
function areInputsFilled(inputs) {
  return Array.from(inputs).every((input) => input.value.trim() !== "");
}

/**
 * Validates the email address format.
 *
 * @param {string} email - The email address entered by the user.
 * @return {boolean} - True if the email format is valid, false otherwise.
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.(de|com)$/;
  return emailPattern.test(email);
}

/**
 * Sends the contact data to Firebase.
 *
 * @async
 * @param {Object} contactData - The contact data object.
 * @return {Object} - The response from Firebase.
 */
async function addContactToFirebase(contactData) {
  const BASE_URL =
    "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
  try {
    const response = await sendContactData(BASE_URL, contactData);
    return await handleFirebaseResponse(response);
  } catch (error) {
    handleError(error);
    return {};
  }
}

/**
 * Sends contact data to Firebase.
 *
 * @async
 * @param {string} BASE_URL - The base URL for Firebase.
 * @param {Object} contactData - The contact data object.
 * @return {Response} - The fetch API response.
 */
async function sendContactData(BASE_URL, contactData) {
  return await fetch(BASE_URL + "contacts.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
}

/**
 * Handles the Firebase response after submitting contact data.
 *
 * @async
 * @param {Response} response - The response from Firebase.
 * @return {Object} - The JSON response from Firebase.
 */
async function handleFirebaseResponse(response) {
  if (!response.ok) {
    console.error("Failed to set data to Firebase:", response.statusText);
    return {};
  }
  return await response.json();
}

/**
 * Logs an error to the console.
 *
 * @param {Error} error - The error object.
 */
function handleError(error) {
  console.error("Error setting data:", error);
}

/**
 * Generates a random color in hex format.
 *
 * @return {string} - A randomly generated color in hex format.
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
 * Generates an emblem from the user's name by taking the first letter of each name part.
 *
 * @param {string} name - The user's full name.
 * @return {string} - The generated emblem.
 */
function generateEmblem(name) {
  const nameParts = name.trim().split(" ");
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const secondInitial =
    nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
  return firstInitial + secondInitial;
}
