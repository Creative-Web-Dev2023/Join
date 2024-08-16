/**
 * Validates the passwords and privacy policy checkbox.
 *
 * @return {boolean} - Returns true if the passwords match and the privacy policy is accepted, otherwise false.
 */
function validatePasswords() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const passwordError = document.getElementById("passwordError");
  const privacyPolicy = document.getElementById("privacyPolicy");

  resetError(passwordError); // Resets the error message visibility.

  // Validate passwords and privacy policy acceptance.
  return (
    arePasswordsMatching(password, confirmPassword, passwordError) &&
    isPrivacyPolicyAccepted(privacyPolicy, passwordError)
  );
}

/**
 * Resets the error message by hiding the error element.
 *
 * @param {HTMLElement} errorElement - The error element to hide.
 */
function resetError(errorElement) {
  errorElement.style.display = "none"; // Hide the error message.
}

/**
 * Checks if the passwords match and displays an error message if they don't.
 *
 * @param {string} password - The password entered by the user.
 * @param {string} confirmPassword - The confirmation password entered by the user.
 * @param {HTMLElement} errorElement - The element where the error message will be displayed.
 * @return {boolean} - Returns true if the passwords match, otherwise false.
 */
function arePasswordsMatching(password, confirmPassword, errorElement) {
  if (password === confirmPassword) return true; // If passwords match, return true.
  showError(errorElement, "Passwords do not match."); // Show error message if passwords don't match.
  return false;
}

/**
 * Checks if the privacy policy checkbox is accepted and displays an error message if not.
 *
 * @param {HTMLElement} privacyPolicyCheckbox - The privacy policy checkbox element.
 * @param {HTMLElement} errorElement - The element where the error message will be displayed.
 * @return {boolean} - Returns true if the privacy policy is accepted, otherwise false.
 */
function isPrivacyPolicyAccepted(privacyPolicyCheckbox, errorElement) {
  if (privacyPolicyCheckbox.checked) return true; // If privacy policy is accepted, return true.
  showError(errorElement, "Please accept the privacy policy."); // Show error if not accepted.
  return false;
}

/**
 * Displays an error message in the provided error element.
 *
 * @param {HTMLElement} errorElement - The element where the error message will be displayed.
 * @param {string} message - The error message to display.
 */
function showError(errorElement, message) {
  errorElement.textContent = message; // Set the error message text.
  errorElement.style.display = "block"; // Display the error message.
}

/**
 * Displays a success popup and redirects the user after a delay.
 */
function showSuccessPopup() {
  const successPopup = document.getElementById("successPopup");
  successPopup.style.display = "block"; // Show the success popup.

  // Animate the popup display.
  setTimeout(() => {
    successPopup.style.bottom = "50%";
  }, 0);

  // Hide the popup and redirect after 1.5 seconds.
  setTimeout(() => {
    successPopup.style.display = "none";
    window.location.href = "/html/summary.html"; // Redirect to the summary page.
  }, 1500);
}

/**
 * Toggles the visibility of the password field.
 *
 * @param {string} id - The ID of the password input field to toggle.
 */
function togglePasswordVisibility(id) {
  const input = document.getElementById(id);
  // Toggle between "password" and "text" input types.
  input.type = input.type === "password" ? "text" : "password";
}

/**
 * Event listener for DOMContentLoaded to handle the enabling/disabling of the signup button
 * based on whether all required inputs are filled and the privacy policy is accepted.
 */
document.addEventListener("DOMContentLoaded", function () {
  const signUpButton = document.getElementById("signUpButton");
  const inputs = document.querySelectorAll("#signupForm input[required]");
  const privacyPolicy = document.getElementById("privacyPolicy");

  // Check whether all inputs are filled and privacy policy is checked.
  function checkInputs() {
    const allFilled = areInputsFilled(inputs);
    signUpButton.disabled = !(allFilled && privacyPolicy.checked); // Enable or disable the signup button.
  }

  inputs.forEach((input) => input.addEventListener("input", checkInputs)); // Add input event listener to each input field.
  privacyPolicy.addEventListener("change", checkInputs); // Add change event listener for privacy policy checkbox.
  checkInputs(); // Initial check to see if the form should be enabled.
});

/**
 * Checks if all required inputs are filled.
 *
 * @param {NodeList} inputs - The list of required input elements.
 * @return {boolean} - Returns true if all inputs are filled, otherwise false.
 */
function areInputsFilled(inputs) {
  return Array.from(inputs).every((input) => input.value.trim() !== ""); // Return true if all inputs have a value.
}

/**
 * Validates the email format against a specific pattern.
 *
 * @param {string} email - The email address to validate.
 * @return {boolean} - Returns true if the email is valid, otherwise false.
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.(de|com)$/; // Regular expression for validating email domains.
  return emailPattern.test(email); // Test the email against the pattern.
}

/**
 * Event listener for form submission to handle form validation and submission to Firebase.
 */
document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission.
    submitContactFB(event); // Call the function to handle Firebase submission.
  });

/**
 * Handles the submission of the contact form to Firebase after validating inputs.
 *
 * @async
 * @param {Event} event - The form submission event.
 */
async function submitContactFB(event) {
  // Collect user input values
  let contactName = document.getElementById("fullName").value;
  let contactEmail = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  // Reference to error elements
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // Reset error messages
  resetError(emailError);
  resetError(passwordError);

  let isValid = true; // Track form validity

  // Validate passwords and privacy policy
  if (!validatePasswords()) {
    isValid = false;
  }

  // Validate email format
  if (!validateEmail(contactEmail)) {
    showError(
      emailError,
      "Please enter a valid email address ending in .de or .com"
    );
    isValid = false;
  }

  // Check for empty name or email fields
  if (!contactName || !contactEmail) {
    isValid = false;
  }

  // If any validation fails, stop form submission
  if (!isValid) {
    return;
  }

  // Prepare the contact data for submission
  const contactData = {
    name: contactName,
    email: contactEmail,
    color: generateRandomColor(),
    emblem: generateEmblem(contactName),
    password: password,
  };

  try {
    // Add contact to Firebase
    await addContactToFirebase(contactData);

    // Save user details to local storage
    localStorage.setItem("fullName", contactName);
    localStorage.setItem("isGuest", "false");

    // Display success popup and clear form fields
    showSuccessPopup();
    clearFormFields();
  } catch (error) {
    console.error("Failed to submit contact data:", error);
  }
}

/**
 * Clears the form input fields after submission.
 */
function clearFormFields() {
  document.getElementById("fullName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
}

/**
 * Generates a random color in hexadecimal format.
 *
 * @return {string} - A random hex color string.
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
 * Generates an emblem from the contact's name, using the first initials of the first and last names.
 *
 * @param {string} name - The contact's full name.
 * @return {string} - A two-letter emblem based on the initials of the name.
 */
function generateEmblem(name) {
  const nameParts = name.trim().split(" ");
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const secondInitial =
    nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
  return firstInitial + secondInitial;
}

/**
 * Adds a new contact to Firebase by sending a POST request with the contact data.
 *
 * @async
 * @param {Object} contactData - The contact data to be stored in Firebase.
 * @return {Object} - The response data from Firebase or an empty object in case of an error.
 */
async function addContactToFirebase(contactData) {
  const BASE_URL =
    "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";

  try {
    const response = await fetch(BASE_URL + "contacts.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    // Check if the request was successful
    if (!response.ok) {
      console.error("Failed to set data to Firebase:", response.statusText);
      return {};
    }

    // Parse and return the response data
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error setting data:", error);
    return {};
  }
}
