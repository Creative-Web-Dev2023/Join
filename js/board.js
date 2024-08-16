/**
 * Initializes the task loading and mutation observer for each kanban column when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", loadTasks);
document.addEventListener("DOMContentLoaded", () => {
  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach((column) => {
    const observer = new MutationObserver(() => {
      updateNoTasksMessage(column);
    });

    observer.observe(column.querySelector(".content"), { childList: true });
    updateNoTasksMessage(column);
  });
});

/**
 * Prevents the default behavior to allow an element to be dropped.
 *
 * @param {DragEvent} event - The drag event object.
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Sets the task ID as transferable data during the drag event.
 *
 * @param {DragEvent} event - The drag event object.
 */
function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

/**
 * Handles the drop event by moving the task to a new column and updating the task data.
 *
 * @param {DragEvent} event - The drop event object.
 */
function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const task = document.getElementById(data);

  let targetColumn = event.target.closest(".kanban-column");
  if (targetColumn) {
    const sourceColumn = task.closest(".kanban-column");
    targetColumn.querySelector(".content").appendChild(task);
    updateNoTasksMessage(sourceColumn);
    updateNoTasksMessage(targetColumn);
    saveTasks();
  }
}

/**
 * Gathers the task data from all columns and saves them to Firebase.
 */
function saveTasks() {
  const tasksData = gatherTasksData();
  saveTasksToFirebase(tasksData);
}

/**
 * Gathers the task IDs from each column and organizes them into a data structure.
 *
 * @return {Object} - An object containing task IDs for each column.
 */
function gatherTasksData() {
  const columns = document.querySelectorAll(".kanban-column");
  const tasksData = {};

  columns.forEach((column, index) => {
    const tasks = column.querySelectorAll(".task");
    tasksData[`column${index}`] = Array.from(tasks).map((task) => task.id);
  });

  return tasksData;
}

/**
 * Sends the gathered tasks data to Firebase.
 *
 * @param {Object} tasksData - The task data to be saved in Firebase.
 */
function saveTasksToFirebase(tasksData) {
  const url =
    "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions.json";
  sendTaskDataToFirebase(url, tasksData);
}

/**
 * Sends the task data to Firebase using a PUT request.
 *
 * @param {string} url - The Firebase URL.
 * @param {Object} tasksData - The task data to be saved in Firebase.
 * @return {Promise<Response>} - The fetch API response.
 */
function sendTaskDataToFirebase(url, tasksData) {
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tasksData),
  }).then((response) => response.json());
}

/**
 * Loads tasks from Firebase and populates the kanban columns.
 */
function loadTasks() {
  fetchTasksPositionsFromFirebase()
    .then((tasksData) => {
      if (tasksData) {
        loadTasksIntoColumns(tasksData);
      }
    })
    .catch(handleLoadTasksError);
}

/**
 * Fetches the task positions from Firebase.
 *
 * @return {Promise<Object>} - A promise that resolves to the task data object from Firebase.
 */
function fetchTasksPositionsFromFirebase() {
  return fetch(
    "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions.json"
  ).then((response) => response.json());
}

/**
 * Loads the tasks into their respective kanban columns based on the task data from Firebase.
 *
 * @param {Object} tasksData - The task data containing task IDs for each column.
 */
function loadTasksIntoColumns(tasksData) {
  Object.keys(tasksData).forEach((columnKey) => {
    const columnIndex = getColumnIndexFromKey(columnKey);
    const column = document.querySelectorAll(".kanban-column")[columnIndex];
    const taskIds = tasksData[columnKey];
    appendTasksToColumn(column, taskIds);
    updateNoTasksMessage(column);
  });
}

/**
 * Extracts the column index from the column key string.
 *
 * @param {string} columnKey - The key representing the column (e.g., "column0").
 * @return {number} - The extracted column index.
 */
function getColumnIndexFromKey(columnKey) {
  return columnKey.replace("column", "");
}

/**
 * Appends tasks to a specific column based on their IDs.
 *
 * @param {HTMLElement} column - The column element to which tasks are appended.
 * @param {Array<string>} taskIds - An array of task IDs to be appended to the column.
 */
function appendTasksToColumn(column, taskIds) {
  taskIds.forEach((taskId) => {
    const task = document.getElementById(taskId);
    if (task) {
      column.querySelector(".content").appendChild(task);
    }
  });
}

/**
 * Handles errors that occur while loading tasks from Firebase.
 *
 * @param {Error} error - The error object.
 */
function handleLoadTasksError(error) {
  console.error("Error loading tasks from Firebase:", error);
}

/**
 * Updates the "No tasks" message for a column based on whether tasks are present.
 *
 * @param {HTMLElement} column - The column element to update the message for.
 */
function updateNoTasksMessage(column) {
  const tasks = column.querySelectorAll(".task");
  const noTasksMessage = column.querySelector(".no-tasks");

  if (tasks.length === 0) {
    noTasksMessage.style.display = "block";
  } else {
    noTasksMessage.style.display = "none";
  }
}

/**
 * Shows the task popup and disables page scrolling.
 */
function showPopup() {
  getButtonData();
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";
  popup.classList.add("show");
  document.body.style.overflowY = "hidden";
}

/**
 * Hides the task popup and enables page scrolling.
 */
function hidePopup() {
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  popup.classList.remove("show");
  setTimeout(function () {
    overlay.style.display = "none";
  }, 500);
  document.body.style.overflowY = "scroll";
}

/**
 * Initializes event handlers for closing the task popup.
 */
function initializePopupHandlers() {
  const closeButton = document.getElementById("closeButton");
  const overlay = document.getElementById("overlay");

  closeButton.addEventListener("click", hidePopup);
  overlay.addEventListener("click", hidePopup);
}

/**
 * Deletes a task element from the DOM.
 *
 * @param {MouseEvent} event - The event triggered by clicking the delete button.
 */
function deleteTask(event) {
  let taskElement = event.target.closest(".popup-task");
  if (taskElement) {
    taskElement.parentNode.removeChild(taskElement);
  }
}

/**
 * Displays the task edit popup.
 */
function editTask() {
  document.getElementById("task-edit-popup").style.display = "block";
}

/**
 * Closes the task edit popup.
 */
function closeTaskEditPopup() {
  document.getElementById("task-edit-popup").style.display = "none";
}

/**
 * Checks the window size and either redirects to the add task page on mobile or shows the popup on larger screens.
 */
function checkWindowSize() {
  if (window.innerWidth <= 769) {
    window.location.href = "/html/add_task.html";
  } else {
    showPopup();
  }
}
