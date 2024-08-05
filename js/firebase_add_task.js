const BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
const BASE_TASKS_URL = `${BASE_URL}tasks.json`;
const BASE_CONTACTS_URL = `${BASE_URL}contacts.json`

let text = document.getElementById('title-input');
let description = document.getElementById('description-input');

let category = document.getElementById('category');
let date = document.getElementById('date');
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
  text.value = '';
  document.querySelector('textarea').value = '';
  document.querySelector('select[name="Selects contacts to assign"]').selectedIndex = 0;
  category.selectedIndex = 0;
  date.value = '';

  document.querySelectorAll('.prio-button').forEach(function (button) {
    button.classList.remove('clicked');
    button.src = button.src.replace('_clicked', '_standart');
  });
}

async function getLength(path = "contacts") {
  let eins = await fetch(BASE_URL + path + ".json");
  let zwei = await eins.json();


  for (let i = 1; i < zwei.length; i++) {
    getName(`contacts/${i}/name`);
  }
}

async function getName(path = "") {
  let drei = await fetch(BASE_URL + path + ".json");
  let vier = await drei.json();
  console.log(vier);
  const name = document.getElementById('dropdown-content');
  name.innerHTML += `
  <div class="dropdown-item" onclick="toggleSelection(this)" data-selected="false">
    <div class="dropdown-label">
        <div class="circle" style="background-color: #00bcd4;">SM</div>
        <div class="chosenName">${vier}</div>
    </div>
    <img src="/assets/img/img_add_task/checkbox.png" class="toggle-image" alt="Unselected" width="20" height="20">
</div>
  `;
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