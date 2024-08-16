const BASE_URL =
  "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
const BASE_TASKS_URL = `${BASE_URL}tasks.json`;
const BASE_CONTACTS_URL = `${BASE_URL}contacts.json`;

let subtask = [];

let text = document.getElementById("title-input");
let description = document.getElementById("description-input");
let category = document.getElementById("category");
let date = document.getElementById("date");
let listtask = subtask;
let priority = "";

/**
 * Counts the tasks and initiates task creation if the form inputs are valid.
 * 
 * @async
 */
async function count() {
  const tasks = await getData("tasks");
  const taskId = tasks ? Object.keys(tasks).length : 0;

  if (text.value > "") {
    if (category.value > "") {
      if (date.value > "") {
        init(taskId + 1);
      }
    }
  }
}

/**
 * Initializes task creation by gathering button data, saving the task to Firebase, and clearing inputs.
 * 
 * @param {number} taskId - The ID of the task to be created.
 */
function init(taskId) {
  getButtonData();
  putOnFB(taskId);
  clearInputs();
  showAddedPopup();
}

/**
 * Saves task data to Firebase under the specified task ID.
 * 
 * @param {number} taskId - The ID of the task to save.
 */
function putOnFB(taskId) {
  const selectedContacts = getSelectedContacts();
  const subtaskStatuses = listtask.map(() => false);
  putData(`tasks/task${taskId}/title`, `${text.value}`);
  putData(`tasks/task${taskId}/description`, `${description.value}`);
  putData(`tasks/task${taskId}/assigned`, selectedContacts);
  putData(`tasks/task${taskId}/date`, `${date.value}`);
  putData(`tasks/task${taskId}/category`, `${category.value}`);
  putData(`tasks/task${taskId}/priority`, `${priority}`);
  putData(`tasks/task${taskId}/subtask`, listtask.join(","));
  putData(`tasks/task${taskId}/subtaskStatuses`, subtaskStatuses);
}

/**
 * Gathers the priority data from the selected button.
 */
function getButtonData() {
  document.querySelectorAll(".prio-button").forEach(function (button) {
    if (button.classList.contains("clicked")) {
      if (button.id === "urgent") priority = "Urgent";
      if (button.id === "medium") priority = "Medium";
      if (button.id === "low") priority = "Low";
    }
  });
}

/**
 * Retrieves the selected contacts from the dropdown menu.
 * 
 * @return {Array<Object>} - An array of selected contact objects, each containing a name and color.
 */
function getSelectedContacts() {
  const selectedContacts = [];
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    if (item.getAttribute("data-selected") === "true") {
      const contactName = item.querySelector(".chosenName").textContent.trim();
      const contactColor = item.querySelector(".circle").style.backgroundColor;
      selectedContacts.push({ name: contactName, color: contactColor });
    }
  });
  updateSelectedContactsDisplay(selectedContacts);
  return selectedContacts;
}

/**
 * Sends data to the specified Firebase path using a PUT request.
 * 
 * @async
 * @param {string} [path=""] - The Firebase path where the data should be saved.
 * @param {Object} data - The data to be saved.
 */
async function putData(path = "", data = {}) {
  await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Clears all input fields, dropdown selections, subtasks, and priority buttons.
 */
function clearInputs() {
  clearInputFields();
  clearDropdownSelections();
  clearSubtaskList();
  resetPriorityButtons();
  clearSelectedContacts();
}

/**
 * Clears the values of the input fields for the task form.
 */
function clearInputFields() {
  text.value = "";
  description.value = "";
  category.selectedIndex = 0;
  date.value = "";
}

/**
 * Clears the selections of the dropdown items.
 */
function clearDropdownSelections() {
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.setAttribute("data-selected", "false");
    const img = item.querySelector(".toggle-image");
    img.src = "/assets/img/img_add_task/checkbox.png";
    img.alt = "Unselected";
    item.style.backgroundColor = "";
    item.style.color = "";
  });
}

/**
 * Clears the subtask list and resets the subtask array.
 */
function clearSubtaskList() {
  const subtaskList = document.getElementById("subtask-list");
  subtaskList.innerHTML = "";
  subtask = [];
  listtask = [];
}

/**
 * Resets the priority buttons by removing the clicked state.
 */
function resetPriorityButtons() {
  document.querySelectorAll(".prio-button").forEach((button) => {
    button.classList.remove("clicked");
    button.src = button.src.replace("_clicked", "_standart");
  });
}

/**
 * Clears the selected contacts display.
 */
function clearSelectedContacts() {
  const selectedContactsContainer = document.getElementById(
    "selected-contacts-container"
  );
  selectedContactsContainer.innerHTML = "";
}

/**
 * Shows the "task added" popup and redirects to the task board after a short delay.
 */
function showAddedPopup() {
  const successPopup = document.getElementById("successPopup");
  successPopup.style.display = "block";

  setTimeout(() => {
    successPopup.style.bottom = "50%";
  }, 0);

  setTimeout(() => {
    successPopup.style.display = "none";
  }, 1500);

  setTimeout(() => {
    window.location.href = "/html/board.html";
  }, 1500);
}

/**
 * Fetches data from the specified Firebase path.
 * 
 * @async
 * @param {string} [path=""] - The Firebase path to fetch data from.
 * @return {Promise<Object>} - The fetched data.
 */
async function getData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  let data = await response.json();
  return data;
}

/**
 * Updates the display for the selected contacts with their initials and colors.
 * 
 * @param {Array<Object>} selectedContacts - The array of selected contact objects.
 */
function updateSelectedContactsDisplay(selectedContacts) {
  const container = document.getElementById("selected-contacts-container");
  container.innerHTML = "";

  selectedContacts.forEach((contact) => {
    const circle = document.createElement("div");
    circle.className = "contact-circle";
    circle.style.backgroundColor = contact.color;
    circle.textContent = contact.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    circle.title = contact.name;
    container.appendChild(circle);
  });
}

/**
 * Fetches and displays contact information from Firebase.
 * 
 * @async
 * @param {string} [path="contacts"] - The Firebase path to fetch contacts from.
 */
async function getInfo(path = "contacts") {
  try {
    let response = await fetch(BASE_URL + path + ".json");
    let contacts = await response.json();
    if (!contacts) {
      return;
    }
    const contactKeys = Object.keys(contacts);
    for (let key of contactKeys) {
      let contactData = await getNameAndColor(`contacts/${key}`);
      if (contactData.name && contactData.color) {
        const nameElement = document.getElementById("dropdown-content");
        nameElement.innerHTML += displayNameColor(
          contactData.name,
          contactData.color,
          contactData.emblem
        );
      }
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

/**
 * Fetches name, color, and emblem data from Firebase for a given contact.
 * 
 * @async
 * @param {string} [path=""] - The Firebase path to fetch the contact data from.
 * @return {Promise<Object>} - An object containing the name, color, and emblem data.
 */
async function getNameAndColor(path = "") {
  const [nameData, colorData, emblemData] = await fetchNameColorEmblem(path);
  return createNameColorEmblemObject(nameData, colorData, emblemData);
}

/**
 * Fetches the name, color, and emblem data from Firebase concurrently.
 * 
 * @async
 * @param {string} path - The Firebase path to fetch the data from.
 * @return {Promise<Array>} - An array containing the name, color, and emblem data.
 */
async function fetchNameColorEmblem(path) {
  const nameResponse = fetch(`${BASE_URL}${path}/name.json`).then((res) =>
    res.json()
  );
  const colorResponse = fetch(`${BASE_URL}${path}/color.json`).then((res) =>
    res.json()
  );
  const emblemResponse = fetch(`${BASE_URL}${path}/emblem.json`).then((res) =>
    res.json()
  );

  return Promise.all([nameResponse, colorResponse, emblemResponse]);
}

/**
 * Creates an object containing the name, color, and emblem data.
 * 
 * @param {string} nameData - The name data.
 * @param {string} colorData - The color data.
 * @param {string} [emblemData=""] - The emblem data.
 * @return {Object} - An object containing the name, color, and emblem data.
 */
function createNameColorEmblemObject(nameData, colorData, emblemData) {
  if (nameData && colorData) {
    return {
      name: nameData,
      color: colorData,
      emblem: emblemData || "",
    };
  }
  return {};
}
