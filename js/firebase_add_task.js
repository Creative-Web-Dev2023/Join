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
  showAddedPopup()
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
      const contactColor = item.querySelector('.circle').style.backgroundColor;
      selectedContacts.push({ name: contactName, color: contactColor });
    }
  });
  updateSelectedContactsDisplay(selectedContacts);
  return selectedContacts;
}

async function putData(path = "", data = {}) {
  let eins = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

function clearInputs() {
  clearInputFields();
  clearDropdownSelections();
  clearSubtaskList();
  resetPriorityButtons();
  clearSelectedContacts();
  console.log('Inputs cleared');
}

function clearInputFields() {
  const text = document.getElementById('title-input');
  const description = document.getElementById('description-input');
  const category = document.getElementById('category');
  const date = document.getElementById('date');

  text.value = '';
  description.value = '';
  category.selectedIndex = 0;
  date.value = '';
}

function clearDropdownSelections() {
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.setAttribute('data-selected', 'false');
    const img = item.querySelector('.toggle-image');
    img.src = '/assets/img/img_add_task/checkbox.png';
    img.alt = 'Unselected';
    item.style.backgroundColor = '';
    item.style.color = '';
  });
}

function clearSubtaskList() {
  const subtaskList = document.getElementById('subtask-list');
  subtaskList.innerHTML = '';
  subtask = [];
  listtask = [];
}

function resetPriorityButtons() {
  document.querySelectorAll('.prio-button').forEach(button => {
    button.classList.remove('clicked');
    button.src = button.src.replace('_clicked', '_standart');
  });
}

function clearSelectedContacts() {
  const selectedContactsContainer = document.getElementById('selected-contacts-container');
  selectedContactsContainer.innerHTML = '';
}


function showAddedPopup() {
  const successPopup = document.getElementById('successPopup');
  successPopup.style.display = 'block';

  setTimeout(() => {
    successPopup.style.bottom = '50%';
  }, 0);

  setTimeout(() => {
    successPopup.style.display = 'none';

  }, 1500);

  setTimeout(() => {

    window.location.href = '/html/board.html';
  }, 1500);
}

async function getData(path = "") {
  let eins = await fetch(BASE_URL + path + ".json");
  let zwei = await eins.json();

  return zwei;
}

function updateSelectedContactsDisplay(selectedContacts) {
  const container = document.getElementById('selected-contacts-container');
  container.innerHTML = '';

  selectedContacts.forEach(contact => {
    const circle = document.createElement('div');
    circle.className = 'contact-circle';
    circle.style.backgroundColor = contact.color;
    circle.textContent = contact.name.split(' ').map(word => word[0]).join('').toUpperCase(); // Use initials
    circle.title = contact.name;
    container.appendChild(circle);
  });
}

async function getInfo(path = "contacts") {
  try {
    let response = await fetch(BASE_URL + path + ".json");
    let contacts = await response.json();

    if (!contacts) {
      console.log("No contacts found.");
      return;
    }

    const contactKeys = Object.keys(contacts);

    for (let key of contactKeys) {
      await getNameAndColor(`contacts/${key}`);
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

async function getNameAndColor(path = "") {
  try {
    let nameResponse = await fetch(BASE_URL + path + "/name.json");
    let nameData = await nameResponse.json();

    let colorResponse = await fetch(BASE_URL + path + "/color.json");
    let colorData = await colorResponse.json();

    let emblemResponse = await fetch(BASE_URL + path + "/emblem.json");
    let emblemData = await emblemResponse.json();

    const nameElement = document.getElementById('dropdown-content');
    nameElement.innerHTML += displayNameColor(nameData, colorData, emblemData);
  } catch (error) {
    console.error("Error fetching name or color:", error);
  }
}

function toggleDropdown() {
  const dropdownContent = document.getElementById('dropdown-content');
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

window.onclick = function (event) {
  const dropdownContent = document.getElementById('dropdown-content');
  const dropdownToggle = document.querySelector('.dropdown-toggle');

  if (dropdownContent.style.display === 'block' && !dropdownContent.contains(event.target) && !dropdownToggle.contains(event.target)) {
    dropdownContent.style.display = 'none';
  }
}

function toggleSelection(item) {
  const isSelected = item.getAttribute('data-selected') === 'true';
  item.setAttribute('data-selected', !isSelected);

  const img = item.querySelector('.toggle-image');
  if (!isSelected) {
    img.src = '/assets/img/img_add_task/checkedbox.png';
    img.alt = 'Selected';

    item.style.backgroundColor = '#2A3647';
    item.style.color = 'white';
  } else {
    img.src = '/assets/img/img_add_task/checkbox.png';

    item.style.backgroundColor = '';
    item.style.color = '';
  }

  getSelectedContacts();
}

function addSubtask() {
  const input = document.getElementById('subtask-input');
  const subtaskText = input.value.trim();

  if (subtaskText === '') return;

  const subtaskList = document.getElementById('subtask-list');

  const subtaskItem = document.createElement('li');
  subtaskItem.className = 'list';
  subtaskItem.contentEditable = 'true';

  subtaskItem.innerHTML = `<p class="subtask">${subtaskText}</p> <img class="trash" src="/assets/img/img_add_task/trash.png">`;

  subtaskItem.querySelector('.trash').addEventListener('click', deleteSubtask);

  subtaskItem.addEventListener('input', updateSubtasks);

  subtaskList.appendChild(subtaskItem);

  pushsubtasks();

  input.value = '';
}

function pushsubtasks() {
  subtask = [];

  const subtaskElements = document.querySelectorAll('.subtask');

  subtaskElements.forEach(element => {
    subtask.push(element.innerHTML);
  });

  listtask = [...subtask];
  console.log('Subtasks:', subtask);
  console.log('Listtask:', listtask);
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
  const subtaskItem = event.target.parentElement;
  subtaskItem.remove();

  pushsubtasks();
}
