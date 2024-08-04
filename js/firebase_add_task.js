const BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
const BASE_TASKS_URL = `${BASE_URL}tasks.json`;

let text = document.getElementById('title-input');
let description = document.getElementById('description-input');
let assignedTo = document.getElementById('assigned-to');
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

  putData(`tasks/task${taskId}/title`, `${text.value}`);
  putData(`tasks/task${taskId}/description`, `${description.value}`);
  putData(`tasks/task${taskId}/assigned`, `${assignedTo.value}`);
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