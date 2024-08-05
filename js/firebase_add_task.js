const BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
const BASE_TASKS_URL = `${BASE_URL}tasks.json`;
const BASE_CONTACTS_URL = `${BASE_URL}contacts.json`

let subtask = [];

let text = document.getElementById('title-input');
let description = document.getElementById('description-input');
let category = document.getElementById('category');
let date = document.getElementById('date');
let listtask = subtask;
let priority = '';

async function count() {
  const tasks = await getData("tasks");
  const taskId = tasks ? Object.keys(tasks).length : 0;

  if (text.value > '') {
    if (category.value > '') {
      if (date.value > '') {
        init(taskId + 1);
      }
    }
  } else {
    console.log('error')
  }
}

function init(taskId) {

  getButtonData();
  const selectedContacts = getSelectedContacts();

  putData(`tasks/task${taskId}/title`, `${text.value}`);
  putData(`tasks/task${taskId}/description`, `${description.value}`);
  putData(`tasks/task${taskId}/assigned`, selectedContacts);
  putData(`tasks/task${taskId}/date`, `${date.value}`);
  putData(`tasks/task${taskId}/category`, `${category.value}`);
  putData(`tasks/task${taskId}/priority`, `${priority}`);
  putData(`tasks/task${taskId}/subtask`, `${listtask}`);

  clearInputs();
}


async function getData(path = "") {
  let eins = await fetch(BASE_URL + path + ".json");
  let zwei = await eins.json();

  console.log('Fetched data:', zwei);
  return zwei;
}

// key plus string
// if i give path plus an array in the data field it gets  keys 0,1,2
async function putData(path = "", data = {}) {

  let eins = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {  // Corrected to 'headers'
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

}
async function editData(id = 44, user = { name: 'kevin' }) {
  putData(`namen/${id}`, user);
}


function getButtonData() {
  document.querySelectorAll('.prio-button').forEach(function (button) {
    if (button.classList.contains('clicked')) {
      if (button.id === 'urgent') priority = 'Urgent';
      if (button.id === 'medium') priority = 'Medium';
      if (button.id === 'low') priority = 'Low';
    }
  });
}

function getSelectedContacts() {
  const selectedContacts = [];
  document.querySelectorAll('.dropdown-item').forEach(item => {
    if (item.getAttribute('data-selected') === 'true') {
      const contactName = item.querySelector('.chosenName').textContent.trim();
      selectedContacts.push(contactName);
    }
  });
  console.log("Ausgewählte Kontakte:", selectedContacts); // Debug-Ausgabe
  return selectedContacts;
}
function clearInputs() {
  // Clear input fields
  text.value = '';
  description.value = '';
  category.selectedIndex = 0;
  date.value = '';

  // Clear selected contacts in the dropdown
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.setAttribute('data-selected', 'false');
    const img = item.querySelector('.toggle-image');
    img.src = '/assets/img/img_add_task/checkbox.png';
    img.alt = 'Unselected';
    item.style.backgroundColor = ''; // Reset background
    item.style.color = ''; // Reset text color
  });

  // Clear the subtask list and the corresponding array
  const subtaskList = document.getElementById('subtask-list');
  subtaskList.innerHTML = ''; // Remove all subtasks from the list
  subtask = []; // Clear the subtask array
  listtask = []; // Clear the listtask array

  // Reset priority buttons
  document.querySelectorAll('.prio-button').forEach(button => {
    button.classList.remove('clicked');
    button.src = button.src.replace('_clicked', '_standart');
  });

  console.log('Inputs cleared');
}

async function getInfo(path = "contacts") {
  let eins = await fetch(BASE_URL + path + ".json");
  let contacts = await eins.json();

  for (let i = 1; i < contacts.length; i++) {
    getNameAndColor(`contacts/${i}`);
  }
}

async function getNameAndColor(path = "") {
  try {
    // Fetch name
    let nameResponse = await fetch(BASE_URL + path + "/name.json");
    let nameData = await nameResponse.json();

    // Fetch color
    let colorResponse = await fetch(BASE_URL + path + "/color.json");
    let colorData = await colorResponse.json();

    let emblemResponse = await fetch(BASE_URL + path + "/emblem.json");
    let emblemData = await emblemResponse.json();

    const nameElement = document.getElementById('dropdown-content');
    nameElement.innerHTML += `
      <div class="dropdown-item" onclick="toggleSelection(this)" data-selected="false">
        <div class="dropdown-label">
          <div class="circle" style="background-color: ${colorData};"><p>${emblemData}</p></div>
          <div class="chosenName">${nameData}</div>
        </div>
        <img src="/assets/img/img_add_task/checkbox.png" class="toggle-image" alt="Unselected" width="20" height="20">
      </div>
    `;
  } catch (error) {
    console.error("Error fetching name or color:", error);
  }
}

function toggleDropdown() {
  const dropdownContent = document.getElementById('dropdown-content');
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

// Schließe das Dropdown-Menü, wenn irgendwo außerhalb des Dropdowns geklickt wird
window.onclick = function (event) {
  const dropdownContent = document.getElementById('dropdown-content');
  const dropdownToggle = document.querySelector('.dropdown-toggle');

  // Überprüfen, ob das geklickte Element nicht das Dropdown oder der Dropdown-Toggle ist
  if (dropdownContent.style.display === 'block' && !dropdownContent.contains(event.target) && !dropdownToggle.contains(event.target)) {
    dropdownContent.style.display = 'none';
  }
}

function toggleSelection(item) {
  // Aktuellen Zustand ermitteln
  const isSelected = item.getAttribute('data-selected') === 'true';

  // Zustand umschalten
  item.setAttribute('data-selected', !isSelected);

  // Bild je nach Zustand ändern
  const img = item.querySelector('.toggle-image');
  if (!isSelected) {
    img.src = '/assets/img/img_add_task/checkedbox.png';  // Bild für ausgewählten Zustand
    img.alt = 'Selected';

    // Hintergrund und Schriftfarbe für ausgewählten Zustand ändern
    item.style.backgroundColor = '#2A3647';
    item.style.color = 'white';
  } else {
    img.src = '/assets/img/img_add_task/checkbox.png';    // Bild für nicht ausgewählten Zustand
    img.alt = 'Unselected';

    // Hintergrund und Schriftfarbe zurücksetzen
    item.style.backgroundColor = ''; // oder initial
    item.style.color = ''; // oder initial
  }
}




// key gets a random underkey plus added data string
async function postData(path = "", data = {}) {
  let eins = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    header: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });


  return zwei = await eins.json();
}

async function deleteData(path = "") {
  let eins = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",

  });


  return zwei = await eins.json();
}
function addSubtask() {
  const input = document.getElementById('subtask-input');
  const subtaskText = input.value.trim();

  if (subtaskText === '') return;

  const subtaskList = document.getElementById('subtask-list');

  // Create a new list item for the subtask
  const subtaskItem = document.createElement('li');
  subtaskItem.className = 'list';
  subtaskItem.contentEditable = 'true';

  // Use a class instead of an ID for the paragraph element
  subtaskItem.innerHTML = `<p class="subtask">${subtaskText}</p> <img class="trash" src="/assets/img/img_add_task/trash.png">`;

  // Add a click event listener to the trash icon for deletion
  subtaskItem.querySelector('.trash').addEventListener('click', deleteSubtask);

  // Add an input event listener to update the subtask array on text change
  subtaskItem.addEventListener('input', updateSubtasks);

  // Append the new subtask item to the list
  subtaskList.appendChild(subtaskItem);

  // Push all subtasks into the array
  pushsubtasks();

  // Clear the input field
  input.value = '';
}

function pushsubtasks() {
  // Clear the existing subtask array
  subtask = [];

  // Select all elements with the class 'subtask'
  const subtaskElements = document.querySelectorAll('.subtask');

  // Iterate over the selected elements and push their innerHTML to the subtask array
  subtaskElements.forEach(element => {
    subtask.push(element.innerHTML);
  });

  // Update listtask to the current state of subtask
  listtask = [...subtask]; // Create a copy of the subtask array
  console.log('Subtasks:', subtask); // Debugging output
  console.log('Listtask:', listtask); // Debugging output
}

function updateSubtasks() {
  const subtaskElements = document.querySelectorAll('.subtask');
  subtask = [];
  subtaskElements.forEach(element => {
    subtask.push(element.innerHTML.trim());
  });
  listtask = [...subtask];
  console.log('Updated Subtasks:', subtask);
}

function deleteSubtask(event) {
  // Remove the parent list item of the clicked trash icon
  const subtaskItem = event.target.parentElement;
  subtaskItem.remove();

  // Update the subtask array after deletion
  pushsubtasks();
}

function clearInputs() {
  // Clear input fields
  text.value = '';
  description.value = '';
  category.selectedIndex = 0;
  date.value = '';

  // Clear selected contacts in the dropdown
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.setAttribute('data-selected', 'false');
    const img = item.querySelector('.toggle-image');
    img.src = '/assets/img/img_add_task/checkbox.png';
    img.alt = 'Unselected';
    item.style.backgroundColor = ''; // Reset background
    item.style.color = ''; // Reset text color
  });

  // Clear the subtask list and the corresponding array
  const subtaskList = document.getElementById('subtask-list');
  subtaskList.innerHTML = ''; // Remove all subtasks from the list
  subtask = []; // Clear the subtask array
  listtask = []; // Clear the listtask array

  // Reset priority buttons
  document.querySelectorAll('.prio-button').forEach(button => {
    button.classList.remove('clicked');
    button.src = button.src.replace('_clicked', '_standart');
  });

  console.log('Inputs cleared');
}