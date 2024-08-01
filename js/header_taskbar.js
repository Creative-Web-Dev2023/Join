function showDropDown() {
    var dropdown = document.getElementById('dropdown');
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

function hideDropdown(event) {
    var dropdown = document.getElementById('dropdown');
    var button = document.getElementById('dropdownButton');
    if (dropdown.style.display === "block" && !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.style.display = "none";
    }
}

document.addEventListener('click', hideDropdown);


function getInitials(name) {
    if (!name) return "G"; // Default to "G" if no name is provided

    const nameParts = name.split(' ');
    let initials = '';

    if (nameParts.length > 1) {
        initials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase();
    } else {
        initials = nameParts[0][0].toUpperCase();
        if (nameParts[0].length > 1) {
            initials += nameParts[0][1].toUpperCase();
        }
    }

    return initials;
}

document.addEventListener('DOMContentLoaded', updateProfileIcon);

function updateProfileIcon() {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const fullName = localStorage.getItem('fullName');
    const profileIcon = document.getElementById('profile-icon');

    // Determine initials based on guest status or stored name
    const initials = isGuest ? 'G' : getInitials(fullName);

    // Update the profile icon with the appropriate initials
    profileIcon.textContent = initials;
}

// Example function for handling guest login
function handleGuestLogin() {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('fullName'); // Optionally remove full name if switching to guest
    updateProfileIcon();
    // Redirect to the relevant page
    window.location.href = '/path/to/guest/homepage.html';
}