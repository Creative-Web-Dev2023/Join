/**
 * Adds event listeners for mouseover, mouseout, and click to all elements with the class 'prio-button'.
 */
document.querySelectorAll(".prio-button").forEach(function (button) {
  button.addEventListener("mouseover", handleMouseOver);
  button.addEventListener("mouseout", handleMouseOut);
  button.addEventListener("click", handleClick);
});

/**
 * Handles the mouseover event for priority buttons.
 * Changes the button's image to the hover state if it is not clicked.
 */
function handleMouseOver() {
  if (!this.classList.contains("clicked")) {
    const hoverSrc = this.src.replace("_standart", "_hover");
    this.src = hoverSrc;
  }
}

/**
 * Handles the mouseout event for priority buttons.
 * Changes the button's image back to the standard state if it is not clicked.
 */
function handleMouseOut() {
  if (!this.classList.contains("clicked")) {
    const standartSrc = this.src.replace("_hover", "_standart");
    this.src = standartSrc;
  }
}

/**
 * Handles the click event for priority buttons.
 * Changes the clicked button's image to the clicked state and resets all other buttons to the standard state.
 */
function handleClick() {
  document.querySelectorAll(".prio-button").forEach(function (btn) {
    if (btn !== this) {
      btn.classList.remove("clicked");
      if (btn.src.includes("_clicked")) {
        btn.src = btn.src.replace("_clicked", "_standart");
      }
    }
  }, this);

  this.classList.add("clicked");
  if (this.src.includes("_hover")) {
    this.src = this.src.replace("_hover", "_clicked");
  } else if (this.src.includes("_standart")) {
    this.src = this.src.replace("_standart", "_clicked");
  }
}

/**
 * Validates form fields for title, category, and date.
 * If any field is empty, it displays an error message.
 */
function error() {
  let text = document.getElementById("title-input");
  let category = document.getElementById("category");
  let date = document.getElementById("date");
  let isEmpty = false;

  isEmpty = validateField(text, "Please fill out this field.") || isEmpty;
  isEmpty = validateField(category, "Please fill out this field.") || isEmpty;
  isEmpty = validateField(date, "Please fill out this field.") || isEmpty;
}

/**
 * Validates an individual form field and sets an error message if the field is empty.
 *
 * @param {HTMLElement} field - The form field to validate.
 * @param {string} message - The error message to display if the field is empty.
 * @return {boolean} - Returns true if the field is empty, otherwise false.
 */
function validateField(field, message) {
  if (field.value.trim() === "") {
    setError(field, message);
    return true;
  } else {
    clearError(field);
    return false;
  }
}

/**
 * Sets an error message on the given form field and updates the field's border color to indicate an error.
 *
 * @param {HTMLElement} field - The form field where the error occurred.
 * @param {string} message - The error message to display.
 */
function setError(field, message) {
  field.style.border = "1px solid #FF8190";
  let errorElement = field.nextElementSibling;
  if (errorElement && errorElement.className === "error-message") {
    errorElement.textContent = message;
  } else {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.style.color = "#FF8190";
    errorElement.textContent = message;
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
}

/**
 * Clears the error message and resets the form field's border to the default state.
 *
 * @param {HTMLElement} field - The form field to clear the error from.
 */
function clearError(field) {
  field.style.border = "1px solid #D1D1D1";
  let errorElement = field.nextElementSibling;
  if (errorElement && errorElement.className === "error-message") {
    errorElement.remove();
  }
}

/**
 * Resets the form input by redirecting the user to the 'add task' page.
 */
function resetInput() {
document.getElementById('title-input').value = "";
document.getElementById('description-input').value = "";
document.getElementById('dropdown-content').value = "";
document.getElementById('selected-contacts-container').innerHTML = "";
document.getElementById('date').value = "";
document.getElementById('category').value = "";
document.getElementById('category').value = "";
document.getElementById('subtask-input').value = "";
document.getElementById('subtask-list').innerHTML = "";
let subtask = [];

const items = document.querySelectorAll('.dropdown-item');
items.forEach(item => {
  item.setAttribute("data-selected", "false");
  item.style.backgroundColor = ""; // Reset background color to default
  item.style.color = ""; // Reset text color to default
  const img = item.querySelector(".toggle-image");
  img.src = "/assets/img/img_add_task/checkbox.png"; // Reset image to unchecked state
  img.alt = "Unselected";
});

document.querySelectorAll(".prio-button").forEach(function (btn) {
  btn.classList.remove("clicked");
  let med = document.getElementById('medium')
  if (btn.src.includes("_clicked")) {
    btn.src = btn.src.replace("_clicked", "_standart");
  }
  med.src = med.src.replace("_standart", "_clicked");
});
}
