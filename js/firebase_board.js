/**
 * Loads the task board by fetching tasks and processing them into their respective columns.
 *
 * @async
 */
async function loadBoard() {
  const tasks = await fetchTasks();
  if (!tasks || tasks.length === 0) return;

  const tasksPositions = await fetchTasksPositions();
  const columnMapping = getColumnMapping();

  for (let index = 0; index < tasks.length; index++) {
    const task = tasks[index];
    await processTask3(task, index, tasksPositions, columnMapping);
  }

  saveTasks();
}

/**
 * Maps column IDs to their corresponding DOM element IDs.
 *
 * @return {Object} - A mapping of column numbers to content element IDs.
 */
function getColumnMapping() {
  return {
    0: "content-todo",
    1: "content-inprogress",
    2: "content-awaitfeedback",
    3: "content-done",
  };
}

/**
 * Processes a task by creating its element, assigning it to a column, and updating its progress bar.
 *
 * @async
 * @param {Object} task - The task data object.
 * @param {number} index - The index of the task.
 * @param {Object} tasksPositions - The task positions in the kanban board.
 * @param {Object} columnMapping - The mapping of column IDs to content element IDs.
 */
async function processTask3(task, index, tasksPositions, columnMapping) {
  const taskElement = createTaskElement(task, index);
  const columnId = findColumnForTask(task.id, tasksPositions);
  const columnContentId = columnMapping[columnId];

  appendTaskToColumn(taskElement, columnContentId);
  await updateProgressBarFromFirebase(task.id);
}

/**
 * Appends a task element to the corresponding kanban column.
 *
 * @param {HTMLElement} taskElement - The task element to be appended.
 * @param {string} columnContentId - The ID of the content element for the column.
 */
function appendTaskToColumn(taskElement, columnContentId) {
  if (columnContentId) {
    const columnContent = document.getElementById(columnContentId);
    if (columnContent) {
      columnContent.appendChild(taskElement);
    } else {
      console.error(
        `Content element not found for column ID: ${columnContentId}`
      );
    }
  } else {
    console.error(`No mapping found for column ID: ${columnContentId}`);
  }
}

/**
 * Fetches task positions from the server.
 *
 * @async
 * @return {Object} - The task positions in the kanban board.
 */
async function fetchTasksPositions() {
  const response = await fetch(
    "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions/.json"
  );
  return await response.json();
}

/**
 * Finds the column ID for a task based on its position in the kanban board.
 *
 * @param {number} taskId - The ID of the task.
 * @param {Object} tasksPositions - The task positions in the kanban board.
 * @return {string} - The column ID where the task is located.
 */
function findColumnForTask(taskId, tasksPositions) {
  if (!tasksPositions || Object.keys(tasksPositions).length === 0) {
    console.error(
      `No task positions found, defaulting task ${taskId} to column 0`
    );
    return "0";
  }

  for (const [columnKey, taskIds] of Object.entries(tasksPositions)) {
    if (taskIds.includes(taskId)) {
      return columnKey.replace("column", "");
    }
  }
  return "0";
}

/**
 * Saves the state of a subtask's checkbox to Firebase.
 *
 * @async
 * @param {number} taskId - The ID of the task containing the subtask.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {boolean} isChecked - The state of the checkbox (checked or unchecked).
 */
async function saveCheckboxState(taskId, subtaskIndex, isChecked) {
  const firebasePath = generateFirebasePath(taskId, subtaskIndex);

  try {
    const response = await sendCheckboxStateToFirebase(firebasePath, isChecked);
    handleResponseStatus(response);
  } catch (error) {
    handleError(error);
    throw error;
  }
}
/**
 * Generates the Firebase path for storing the subtask status.
 *
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @return {string} - The Firebase path for the subtask status.
 */
function generateFirebasePath(taskId, subtaskIndex) {
  return `tasks/task${taskId}/subtaskStatuses/${subtaskIndex}.json`;
}

/**
 * Sends the subtask checkbox state to Firebase.
 *
 * @async
 * @param {string} firebasePath - The Firebase path for the subtask status.
 * @param {boolean} isChecked - The checkbox state (true for checked, false for unchecked).
 * @return {Promise<Response>} - The fetch API response.
 */
async function sendCheckboxStateToFirebase(firebasePath, isChecked) {
  return await fetch(BASE_URL + firebasePath, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isChecked),
  });
}

/**
 * Handles the response from Firebase and throws an error if the response is not ok.
 *
 * @param {Response} response - The fetch response from Firebase.
 * @throws Will throw an error if the response status is not ok.
 */
function handleResponseStatus(response) {
  if (!response.ok) {
    throw new Error("Fehler beim Speichern des Zustands in Firebase");
  }
}

/**
 * Logs an error message when saving checkbox state to Firebase fails.
 *
 * @param {Error} error - The error object.
 */
function handleError(error) {
  console.error(
    "Fehler beim Speichern des Checkbox-Zustands in Firebase:",
    error
  );
}

/**
 * Processes a task with subtasks by fetching subtask data and updating the progress bar.
 *
 * @async
 * @param {Object} task - The task data object.
 * @param {number} index - The index of the task.
 * @return {Promise<HTMLElement>} - The task element with subtasks processed.
 */
async function processTaskWithSubtasks(task, index) {
  const taskElement = createTaskElement(task, index);

  const subtaskText = await subtaskFB(`tasks/task${task.id}/subtask`);
  if (subtaskText) {
    const subtasksContainer = document.createElement("div");
    taskElement.appendChild(subtasksContainer);

    await updateProgressBarFromFirebase(task.id);
  }

  return taskElement;
}

/**
 * Updates the progress bar for a task by fetching subtask statuses from Firebase.
 *
 * @async
 * @param {number} taskId - The ID of the task to update the progress bar for.
 */
async function updateProgressBarFromFirebase(taskId) {
  const savedStatuses = await getSavedStatusesFromFirebase(taskId);

  const totalSubtasks = savedStatuses.length;
  const completedCount = savedStatuses.filter(
    (status) => status === true
  ).length;

  updateProgressBarUI(taskId, completedCount, totalSubtasks);
  updateSubtaskCountElement(taskId, completedCount, totalSubtasks);
}

/**
 * Displays a message indicating that no tasks are available.
 *
 * @param {HTMLElement} container - The container to display the message in.
 */
function showNoTasksMessage(container) {
  container.innerHTML = "<p>No tasks available.</p>";
}

/**
 * Processes a task by creating its element, adding it to the container, and updating its progress bar.
 *
 * @param {Object} task - The task data object.
 * @param {number} index - The index of the task.
 * @param {HTMLElement} container - The container to append the task element to.
 */
function processTask(task, index, container) {
  const taskElement = createTaskElement(task, index);
  container.appendChild(taskElement);
  loadSubtaskProgress(index + 1);
  updateProgressBarFromFirebase(index + 1);
}

/**
 * Calculates the number of completed and total subtasks from the subtask statuses.
 *
 * @param {Array<boolean>} statuses - An array of subtask statuses (true for completed, false for not completed).
 * @return {Object} - An object containing the completed count and total subtasks.
 */
function calculateSubtaskCounts(statuses) {
  const completedCount = statuses.filter((status) => status).length;
  return { completedCount, totalSubtasks: statuses.length };
}

/**
 * Updates the subtask count element for a task.
 *
 * @param {number} taskId - The ID of the task.
 * @param {number} completedCount - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 */
function updateSubtaskCountElement(taskId, completedCount, totalSubtasks) {
  const subtaskCountElement = document.getElementById(
    `subtask-count-${taskId}`
  );
  if (subtaskCountElement) {
    subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
  }
}

/**
 * Updates the progress bar for a task based on the subtask completion.
 *
 * @param {number} taskId - The ID of the task.
 */
function updateProgress(taskId) {
  const subtaskImages = getSubtaskImages(taskId);
  const { completedCount, totalSubtasks } =
    calculateSubtaskCompletion(subtaskImages);

  updateProgressBarUI(taskId, completedCount, totalSubtasks);
  updateSubtaskCountUI(taskId, completedCount, totalSubtasks);

  saveSubtaskProgress(taskId, subtaskImages);
}

/**
 * Retrieves the subtask images for a task.
 *
 * @param {number} taskId - The ID of the task.
 * @return {NodeList} - A NodeList of subtask images.
 */
function getSubtaskImages(taskId) {
  return document.querySelectorAll(`#popup-task${taskId} .subtask img`);
}

/**
 * Calculates the number of completed subtasks from the subtask images.
 *
 * @param {NodeList} subtaskImages - A NodeList of subtask images.
 * @return {Object} - An object containing the completed count and total subtasks.
 */
function calculateSubtaskCompletion(subtaskImages) {
  const completedCount = Array.from(subtaskImages).filter((img) =>
    img.src.includes("checkesbox.png")
  ).length;
  return { completedCount, totalSubtasks: subtaskImages.length };
}

/**
 * Updates the progress bar UI for a task based on the number of completed and total subtasks.
 *
 * @param {number} taskId - The ID of the task.
 * @param {number} completedCount - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 */
function updateProgressBarUI(taskId, completedCount, totalSubtasks) {
  const progressBar = document.getElementById(`progress-bar-${taskId}`);
  if (progressBar) {
    const progressPercentage = (completedCount / totalSubtasks) * 100;
    progressBar.style.width = `${progressPercentage}%`;
  }
}

/**
 * Updates the subtask count UI for a task based on the number of completed and total subtasks.
 *
 * @param {number} taskId - The ID of the task.
 * @param {number} completedCount - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 */
function updateSubtaskCountUI(taskId, completedCount, totalSubtasks) {
  const subtaskCountElement = document.getElementById(
    `subtask-count-${taskId}`
  );
  if (subtaskCountElement) {
    subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
  }
}

/**
 * Saves the subtask progress to Firebase.
 *
 * @async
 * @param {number} taskId - The ID of the task.
 */
async function saveSubtaskProgress(taskId) {
  const subtaskStatuses = getSubtaskStatuses(taskId);
  const firebasePath = generateFirebaseSubtaskPath(taskId);

  try {
    await sendSubtaskStatusesToFirebase(firebasePath, subtaskStatuses);
  } catch (error) {
    handleSaveError(error);
  }
}
