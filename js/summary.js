/**
 * The base URL for the remote database.
 * @constant {string}
 */
const BASE_URL =
  "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Executes summaryCounts and updates the greeting when the DOM content is fully loaded.
 */
document.addEventListener("DOMContentLoaded", summaryCounts);
document.addEventListener("DOMContentLoaded", () => {
  const isGuest = localStorage.getItem("isGuest");
  const fullName = localStorage.getItem("fullName");
  const greetingElement = document.getElementById("greeting");
  const greetedNameElement = document.getElementById("greeted-name");

  if (isGuest === "true") {
    greetingElement.textContent = getGreeting();
    greetedNameElement.textContent = "Guest";
  } else if (fullName) {
    greetingElement.textContent = getGreeting();
    greetedNameElement.textContent = fullName;
  } else {
    greetingElement.textContent = "Willkommen auf unserer Seite.";
    greetedNameElement.textContent = "";
  }
});

/**
 * Generates a greeting message based on the current time of day.
 * 
 * @return {string} - A greeting message like "Good morning", "Good afternoon", or "Good evening".
 */
function getGreeting() {
  const currentHour = new Date().getHours();
  let greeting;

  if (currentHour < 12) {
    greeting = "Good morning!";
  } else if (currentHour < 18) {
    greeting = "Good afternoon!";
  } else {
    greeting = "Good evening!";
  }

  return greeting;
}

/**
 * Fetches task positions and updates the task summary counts.
 * @async
 */
async function summaryCounts() {
  const tasksPositions = await fetchTasksPositions();
  todoCount(tasksPositions);
  doneCount(tasksPositions);
  progressCount(tasksPositions);
  feedbackCount(tasksPositions);
  allCount(tasksPositions);
}

/**
 * Fetches the task positions data from the remote server.
 * 
 * @async
 * @return {Object} - A JSON object representing the tasks in different columns (e.g., todo, progress, etc.).
 */
async function fetchTasksPositions() {
  try {
    const response = await fetch(`${BASE_URL}tasksPositions.json`);
    const tasksPositions = await response.json();
    return tasksPositions;
  } catch (error) {
    console.error("Error fetching tasks positions:", error);
    return {};
  }
}

/**
 * Updates the total number of tasks in all columns.
 * 
 * @param {Object} tasksPositions - The tasks organized by columns.
 */
function allCount(tasksPositions) {
  let all = document.getElementById("allCounter");

  let totalTasks = 0;
  for (const column in tasksPositions) {
    if (tasksPositions.hasOwnProperty(column)) {
      totalTasks += tasksPositions[column].length;
    }
  }

  all.innerHTML = `
    ${totalTasks}
    `;
}

/**
 * Updates the count of tasks in the "To Do" column.
 * 
 * @param {Object} tasksPositions - The tasks organized by columns.
 */
function todoCount(tasksPositions) {
  const column0Tasks = tasksPositions.column0 || [];
  let todo = document.getElementById("todoCounter");

  todo.innerHTML = `
    ${column0Tasks.length}
    `;
}

/**
 * Updates the count of tasks in the "In Progress" column.
 * 
 * @param {Object} tasksPositions - The tasks organized by columns.
 */
function progressCount(tasksPositions) {
  const column1Tasks = tasksPositions.column1 || [];
  let progress = document.getElementById("progressCounter");

  progress.innerHTML = `
    ${column1Tasks.length}
    `;
}

/**
 * Updates the count of tasks in the "Feedback" column.
 * 
 * @param {Object} tasksPositions - The tasks organized by columns.
 */
function feedbackCount(tasksPositions) {
  const column2Tasks = tasksPositions.column2 || [];
  let feedback = document.getElementById("feedbackCounter");

  feedback.innerHTML = `
    ${column2Tasks.length}
    `;
}

/**
 * Updates the count of tasks in the "Done" column.
 * 
 * @param {Object} tasksPositions - The tasks organized by columns.
 */
function doneCount(tasksPositions) {
  const column3Tasks = tasksPositions.column3 || [];
  let done = document.getElementById("doneCounter");

  done.innerHTML = `
    ${column3Tasks.length}
    `;
}

/**
 * Redirects the user to the task board page.
 */
function openTaskBoard() {
  window.location.href = "./board.html";
}
