/**
 * Adds a click event listener to the login button.
 * Sets the user as a guest and redirects to the summary page.
 */
document.getElementById("loginButton").addEventListener("click", () => {
  localStorage.setItem("isGuest", "true");
  window.location.href = "../html/summary.html";
});

/**
 * Redirects the user to the sign-up page.
 */
function openSignUpPage() {
  window.location.href = "./html/sign_up.html";
}

/**
 * Redirects the user to the privacy policy page.
 */
function openPrivacyPolicyPage() {
  window.location.href = "../html/privacy_policy_noconto.html";
}

/**
 * Redirects the user to the legal notice page.
 */
function openLegalNoticePage() {
  window.location.href = "../html/legal_notice_noconto.html";
}

/**
 * Resets the outline of a specified field element.
 *
 * @param {string} fieldId - The ID of the field to reset the outline for.
 */
function resetOutline(fieldId) {
  document.getElementById(fieldId).style.outline = "";
}

/**
 * Logs in the user by retrieving input, validating credentials, and fetching user data.
 */
function login() {
  const { email, password, rememberMe } = getUserInput();
  if (!validateCredentials(email, password)) return;
  fetchUserData(email, password, rememberMe);
}

/**
 * Retrieves user input from the login form.
 *
 * @return {Object} - An object containing the user's email, password, and rememberMe status.
 */
function getUserInput() {
  return {
    email: getInputValue("email"),
    password: getInputValue("password"),
    rememberMe: document.getElementById("checkbox").checked,
  };
}

/**
 * Validates the user's email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @return {boolean} - True if the credentials are valid, false otherwise.
 */
function validateCredentials(email, password) {
  return validateEmail(email) && validatePassword(password);
}

/**
 * Fetches user data from the remote server and processes the login attempt.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {boolean} rememberMe - Whether the user opted to be remembered.
 */
function fetchUserData(email, password, rememberMe) {
  fetch(
    "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/contacts.json"
  )
    .then((response) => response.json())
    .then((data) => processUserData(data, email, password, rememberMe))
    .catch(() =>
      displayErrorMessage("email", "An error occurred. Please try again later.")
    );
}

/**
 * Processes the fetched user data to validate login credentials.
 *
 * @param {Object} data - The user data from the server.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {boolean} rememberMe - Whether the user opted to be remembered.
 */
function processUserData(data, email, password, rememberMe) {
  for (let key in data) {
    if (data[key].email === email && data[key].password === password) {
      handleLoginSuccess(data[key], rememberMe);
      return;
    }
  }
  displayErrorMessage("email", "Invalid email or password.");
}

/**
 * Retrieves the trimmed value of a specified input field.
 *
 * @param {string} id - The ID of the input field.
 * @return {string} - The trimmed value of the input field.
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Validates the email address provided by the user.
 *
 * @param {string} email - The user's email address.
 * @return {boolean} - True if the email is valid, false otherwise.
 */
function validateEmail(email) {
  if (email === "") {
    displayErrorMessage("email", "Please enter an email address.");
    return false;
  } else if (!isValidEmail(email)) {
    displayErrorMessage("email", "Please enter a valid email address.");
    return false;
  }
  return true;
}

/**
 * Validates the password provided by the user.
 *
 * @param {string} password - The user's password.
 * @return {boolean} - True if the password is valid, false otherwise.
 */
function validatePassword(password) {
  if (password === "") {
    displayErrorMessage("password", "Please enter your password.");
    return false;
  } else if (password.length < 3) {
    displayErrorMessage(
      "password",
      "The password must be at least 3 characters long."
    );
    return false;
  }
  return true;
}

/**
 * Handles successful login and stores the user authentication token.
 *
 * @param {Object} user - The user's data object.
 * @param {boolean} rememberMe - Whether the user opted to be remembered.
 */
function handleLoginSuccess(user, rememberMe) {
  const token = btoa(`${user.email}:${user.password}`);

  if (rememberMe) {
    localStorage.setItem("authToken", token);
  } else {
    sessionStorage.setItem("authToken", token);
  }

  window.location.href = "./html/summary.html";
}

/**
 * Toggles the checkbox icon between checked and unchecked states.
 */
function checkIcon() {
  const checkbox = document.getElementById("checkbox");
  if (checkbox.classList.contains("unchecked")) {
    checkbox.classList.remove("unchecked");
    checkbox.classList.add("checked");
    checkbox.src = "../assets/img/img_login/checkmark_checked_dark.png";
  } else {
    checkbox.classList.remove("checked");
    checkbox.classList.add("unchecked");
    checkbox.src = "../assets/img/img_login/checkmark-empty_dark.png";
  }
}

/**
 * Displays an error message for a specific input field.
 *
 * @param {string} fieldId - The ID of the input field.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(fieldId, message) {
  const messageBoxId = `messagebox${capitalizeFirstLetter(fieldId)}`;
  const messageBox = document.getElementById(messageBoxId);
  messageBox.innerText = message;
  document.getElementById(fieldId).style.outline = "2px solid red";
}

/**
 * Checks if the provided email address is valid.
 *
 * @param {string} email - The user's email address.
 * @return {boolean} - True if the email is valid, false otherwise.
 */
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string - The string to capitalize.
 * @return {string} - The capitalized string.
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
