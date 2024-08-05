const BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";
const BASE_TASKS_URL = `${BASE_URL}tasks.json`;

let text = document.getElementById('title-input');
let description = document.getElementById('description-input');
let assignedTo = document.getElementById('assigned-to');
let category = document.getElementById('category');
let date = document.getElementById('date');
let priority = '';

async function loadTask() {
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


function getButtonData() {
    document.querySelectorAll('.prio-button').forEach(function (button) {
      if (button.classList.contains('clicked')) {
        if (button.id === 'urgent') priority = 'Urgent';
        if (button.id === 'medium') priority = 'Medium';
        if (button.id === 'low') priority = 'Low';
      }
    });
  }