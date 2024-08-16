/**
 * Event listener for DOMContentLoaded to update the profile icon.
 */
document.addEventListener("DOMContentLoaded", updateProfileIcon);

/**
 * Event listener for click events to hide the dropdown if clicked outside.
 */
document.addEventListener("click", hideDropdown);

/**
 * Toggles the display of the dropdown menu.
 */
function showDropDown() {
  var dropdown = document.getElementById("dropdown");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

/**
 * Hides the dropdown if the click is outside the dropdown or the dropdown button.
 * 
 * @param {Event} event - The click event object.
 */
function hideDropdown(event) {
  var dropdown = document.getElementById("dropdown");
  var button = document.getElementById("dropdownButton");
  if (
    dropdown.style.display === "block" &&
    !dropdown.contains(event.target) &&
    !button.contains(event.target)
  ) {
    dropdown.style.display = "none";
  }
}

/**
 * Extracts the initials from a given name.
 * If the name has multiple parts, it returns the first letter of the first and last name.
 * 
 * @param {string} name - The full name to extract initials from.
 * @return {string} - The initials derived from the name. Returns 'G' if the name is empty or not provided.
 */
function getInitials(name) {
  if (!name) return "G";

  const nameParts = name.split(" ");
  let initials = "";

  if (nameParts.length > 1) {
    initials =
      nameParts[0][0].toUpperCase() +
      nameParts[nameParts.length - 1][0].toUpperCase();
  } else {
    initials = nameParts[0][0].toUpperCase();
    if (nameParts[0].length > 1) {
      initials += nameParts[0][1].toUpperCase();
    }
  }

  return initials;
}

/**
 * Updates the profile icon with the initials of the user's name or 'G' for guest users.
 */
function updateProfileIcon() {
  const isGuest = localStorage.getItem("isGuest") === "true";
  const fullName = localStorage.getItem("fullName");
  const profileIcon = document.getElementById("profile-icon");
  const initials = isGuest ? "G" : getInitials(fullName);
  profileIcon.textContent = initials;
  const textLength = profileIcon.textContent.length;

  if (textLength > 1) {
    FullName(profileIcon, initials);
  }
}

/**
 * Truncates the initials to only two characters.
 * 
 * @param {HTMLElement} profileIcon - The profile icon element to display the initials.
 * @param {string} initials - The initials to be displayed.
 */
function FullName(profileIcon, initials) {
  profileIcon.textContent = initials.slice(0, 2);
}

/**
 * Handles the guest login by setting the user as a guest in localStorage, 
 * clearing the full name, updating the profile icon, and redirecting to the guest homepage.
 */
function handleGuestLogin() {
  localStorage.setItem("isGuest", "true");
  localStorage.removeItem("fullName");
  updateProfileIcon();
  window.location.href = "/path/to/guest/homepage.html";
}
