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