/**
 * Adds event listeners to filter tasks based on user input.
 */
document.getElementById("findTask").addEventListener("input", filterTasks);
document.getElementById("findTaskResponsive").addEventListener("input", filterTaskss);

/**
 * Collects task data and saves it to Firebase. Adds the task to the first column and navigates to the board page.
 * 
 * @param {number} taskId - The ID of the task to be saved.
 */
function putOnFb(taskId) {
    const taskData = collectTaskData();
    if (!validateTaskData(taskData)) return;
    const newSubtasks = collectNewSubtasks();
    const subtaskStatuses = newSubtasks.map(() => false);
    taskData.subtask = newSubtasks.join(",");
    taskData.subtaskStatuses = subtaskStatuses;
    saveTaskToFb(taskId, taskData).then(() => {
      addToColumn0(taskId);
    });
    window.location.href = "/html/board.html";
}

/**
 * Adds a task to the first column of the board.
 * 
 * @param {number} taskId - The ID of the task to be added.
 */
function addToColumn0(taskId) {
    fetchColumn0Tasks()
      .then((column0Tasks) => updateColumn0Tasks(column0Tasks, taskId))
      .catch(handleAddToColumnError);
}

/**
 * Fetches tasks from column0 in Firebase.
 * 
 * @returns {Promise<Array>} - A promise that resolves to an array of tasks in column0.
 */
async function fetchColumn0Tasks() {
    const response = await fetch(
      "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions/column0.json"
    );
    const column0Tasks = await response.json();
    return Array.isArray(column0Tasks) ? column0Tasks : [];
}

/**
 * Updates tasks in column0 by adding a new task ID.
 * 
 * @param {Array} column0Tasks - The current list of tasks in column0.
 * @param {number} taskId - The ID of the task to be added.
 * @returns {Promise<Object>} - A promise that resolves to the updated task list.
 */
async function updateColumn0Tasks(column0Tasks, taskId) {
    column0Tasks.push(`task${taskId}`);
    const response = await fetch(
      "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions/column0.json",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(column0Tasks),
      }
    );
    return await response.json();
}

/**
 * Handles errors when adding tasks to column0.
 * 
 * @param {Error} error - The error object.
 */
function handleAddToColumnError(error) {
    console.error("Fehler beim Hinzufügen der Task zu column0:", error);
}

/**
 * Collects data from the task creation form.
 * 
 * @returns {Object} - An object containing the task data.
 */
function collectTaskData() {
    return {
      title: document.getElementById("title-input").value,
      description: document.getElementById("description-input").value,
      date: document.getElementById("date").value,
      category: document.getElementById("category").value,
      priority: document.querySelector(".prio-button.clicked")?.alt || "",
      assigned: getSelectedContacts(),
    };
}

/**
 * Validates the task data to ensure required fields are filled.
 * 
 * @param {Object} param0 - The task data object.
 * @param {string} param0.title - The title of the task.
 * @param {string} param0.date - The due date of the task.
 * @param {string} param0.category - The category of the task.
 * @returns {boolean} - True if the data is valid, otherwise false.
 */
function validateTaskData({ title, date, category }) {
    return title && date && category;
}

/**
 * Collects subtasks from the task creation form.
 * 
 * @returns {Array<string>} - An array of subtasks.
 */
function collectNewSubtasks() {
    return Array.from(document.querySelectorAll("#subtask-list .subtask")).map(
      (p) => p.textContent.trim()
    );
}

/**
 * Merges new subtasks with existing ones and saves them to Firebase.
 * 
 * @param {number} taskId - The ID of the task.
 * @param {Array<string>} newSubtasks - The array of new subtasks.
 * @param {Object} taskData - The task data to be saved.
 */
function mergeAndSaveSubtasks(taskId, newSubtasks, taskData) {
    subtaskFB(`tasks/task${taskId}/subtask`)
      .then((existingSubtasks) => {
        const existingSubtaskArray = Array.isArray(existingSubtasks)
          ? existingSubtasks
          : existingSubtasks
              .split(",")
              .filter((subtask) => subtask.trim() !== "");
        const combinedSubtasks = [...newSubtasks, ...existingSubtaskArray].filter(
          (subtask, index, self) => self.indexOf(subtask) === index
        );
        taskData.subtask = combinedSubtasks.join(",");
        taskData.assigned = getSelectedContacts();
        saveTaskToFb(taskId, taskData);
      })
      .catch(console.error);
}

/**
 * Saves a task to Firebase.
 * 
 * @param {number} taskId - The ID of the task.
 * @param {Object} taskData - The data of the task to be saved.
 * @returns {Promise<void>}
 */
function saveTaskToFb(taskId, taskData) {
    putData(`tasks/task${taskId}`, taskData)
      .then(() => (window.location.href = "/html/board.html"))
      .catch((error) => {
        console.error("Error updating task:", error);
      });
}

/**
 * Fetches date from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch the due date from.
 * @returns {Promise<string|Object>} - The due date or an error message.
 */
async function dateFB(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let dueDate = await response.json();
      return dueDate;
    } catch (error) {
      console.error("Error fetching duedate:", error);
      return "Error loading duedate";
    }
}

/**
 * Fetches subtasks from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch subtasks from.
 * @returns {Promise<Array|string>} - An array of subtasks or an empty array.
 */
async function subtaskFB(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let subtask = await response.json();
      return subtask;
    } catch (error) {
      console.error("Error fetching subtask:", error);
      return [];
    }
}
  /**
 * Fetches the description from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch the description from.
 * @returns {Promise<string|Object>} - The description data or an error message.
 */
async function descriptionFB(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let description = await response.json();
      return description;
    } catch (error) {
      console.error("Error fetching description:", error);
      return "Error loading description";
    }
}

/**
 * Fetches the title from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch the title from.
 * @returns {Promise<string|Object>} - The title data or an error message.
 */
async function title(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let title = await response.json();
      return title;
    } catch (error) {
      console.error("Error fetching title:", error);
      return "Error loading title";
    }
}

/**
 * Fetches the user story from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch the user story from.
 * @returns {Promise<string|Object>} - The user story data or an error message.
 */
async function userStory(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let userStory = await response.json();
      return userStory;
    } catch (error) {
      console.error("Error fetching user story:", error);
      return "Error loading user story";
    }
}

/**
 * Fetches the assigned people from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch assigned people from.
 * @returns {Promise<Array|string>} - The list of assigned people or an error message.
 */
async function assignedFB(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let assigned = await response.json();
      return assigned;
    } catch (error) {
      console.error("Error fetching assigned people:", error);
      return [];
    }
}

/**
 * Fetches the priority from Firebase.
 * 
 * @param {string} [path=""] - The path to fetch the priority from.
 * @returns {Promise<string|Object>} - The priority data or an error message.
 */
async function priorityFB(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json");
      let priority = await response.json();
      return priority;
    } catch (error) {
      console.error("Error fetching priority:", error);
      return "Error loading priority";
    }
}

/**
 * Animates the progress bar.
 */
function move() {
    if (i == 0) {
      i = 1;
      var elem = document.getElementById("myBar");
      var width = 10;
      var id = setInterval(frame, 10);
      function frame() {
        if (width >= 100) {
          clearInterval(id);
          i = 0;
        } else {
          width++;
          elem.style.width = width + "%";
          elem.innerHTML = width + "%";
        }
      }
    }
}

/**
 * Deletes a task from Firebase and renumbers remaining tasks.
 * 
 * @param {number} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
    try {
      await deleteTaskFromFirebase(taskId);
      const remainingTasks = await fetchRemainingTasks();
  
      if (!remainingTasks.length) {
        console.error("No tasks found in Firebase.");
        return;
      }
  
      const renumberedTasks = renumberTasks(remainingTasks);
      await updateTasksInFirebase(renumberedTasks);
  
      closePopupAndReload();
    } catch (error) {
      handleError2(error);
    }
}

/**
 * Deletes a task from Firebase.
 * 
 * @param {number} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 * @throws Will throw an error if the task deletion fails.
 */
async function deleteTaskFromFirebase(taskId) {
    const taskPath = `${BASE_URL}tasks/task${taskId}.json`;
    const response = await fetch(taskPath, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`Error deleting task ${taskId}`);
    }
}

/**
 * Fetches the remaining tasks from Firebase.
 * 
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of remaining tasks.
 */
async function fetchRemainingTasks() {
    const response = await fetch(`${BASE_URL}tasks.json`);
    const tasksData = await response.json();
    if (!tasksData) return [];
  
    return Object.keys(tasksData).map((key) => ({
      id: key,
      data: tasksData[key],
    }));
}

/**
 * Renumbers the tasks after a deletion.
 * 
 * @param {Array<Object>} tasks - The remaining tasks.
 * @returns {Object} - The renumbered tasks.
 */
function renumberTasks(tasks) {
    return tasks
      .sort(
        (a, b) =>
          parseInt(a.id.replace("task", "")) - parseInt(b.id.replace("task", ""))
      )
      .reduce((renumberedTasks, task, index) => {
        renumberedTasks[`task${index + 1}`] = task.data;
        return renumberedTasks;
      }, {});
}

/**
 * Updates tasks in Firebase after renumbering.
 * 
 * @param {Object} renumberedTasks - The renumbered task data.
 * @returns {Promise<void>}
 */
async function updateTasksInFirebase(renumberedTasks) {
    await fetch(`${BASE_URL}tasks.json`, { method: "DELETE" });
    await fetch(`${BASE_URL}tasks.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(renumberedTasks),
    });
}

/**
 * Closes the popup and reloads the page.
 */
function closePopupAndReload() {
    closePopup();
    window.location.href = "../html/board.html";
}

/**
 * Handles errors during the task deletion and renumbering process.
 * 
 * @param {Error} error - The error object.
 */
function handleError2(error) {
    console.error("Error deleting and renumbering tasks:", error);
}

/**
 * Updates task positions after deletion by fetching and removing the deleted task from positions.
 * 
 * @param {number} taskId - The ID of the deleted task.
 * @returns {Promise<void>}
 */
async function updateTaskPositionsAfterDeletion(taskId) {
    try {
      const tasksPositions = await fetchTaskPositions();
      const updatedPositions = removeTaskFromPositions(tasksPositions, taskId);
      await updateFirebaseTaskPositions(updatedPositions);
    } catch (error) {
      handleTaskPositionError(error);
    }
}

/**
 * Fetches task positions from Firebase.
 * 
 * @returns {Promise<Object>} - A promise that resolves to the task positions.
 */
async function fetchTaskPositions() {
    const response = await fetch(BASE_URL + "tasksPositions.json");
    return await response.json();
}

/**
 * Removes a task from the task positions.
 * 
 * @param {Object} tasksPositions - The current task positions.
 * @param {number} taskId - The ID of the task to remove.
 * @returns {Object} - The updated task positions.
 */
function removeTaskFromPositions(tasksPositions, taskId) {
    Object.keys(tasksPositions).forEach((columnKey) => {
      tasksPositions[columnKey] = tasksPositions[columnKey].filter(
        (id) => id !== `task${taskId}`
      );
    });
    return tasksPositions;
}

/**
 * Updates task positions in Firebase.
 * 
 * @param {Object} updatedPositions - The updated task positions.
 * @returns {Promise<void>}
 */
async function updateFirebaseTaskPositions(updatedPositions) {
    await fetch(BASE_URL + "tasksPositions.json", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPositions),
    });
}

/**
 * Handles errors when updating task positions.
 * 
 * @param {Error} error - The error object.
 */
function handleTaskPositionError(error) {
    console.error("Error updating task positions:", error);
}

/**
 * Deletes data from Firebase at a specified path.
 * 
 * @param {string} [path=""] - The path of the data to delete.
 * @returns {Promise<Object|null>} - The deleted data or null if an error occurs.
 */
async function deleteData(path = "") {
    try {
      let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      return response.json();
    } catch (error) {
      console.error("Error deleting data:", error);
      return null;
    }
}

/**
 * Closes the task popup and hides the overlay.
 */
function closePopup() {
    const popup = document.getElementById("popup-tasks");
    const overlay = document.getElementById("overlay-task");
  
    document.body.style.overflowY = "scroll";
    if (popup) {
      popup.style.display = "none";
      popup.innerHTML = "";
    }
  
    if (overlay) {
      overlay.style.display = "none";
    }
  
    currentTaskData = {};
}

/**
 * Filters tasks based on user input in a responsive search field.
 */
function filterTaskss() {
    const searchTerm = document
      .getElementById("findTaskResponsive")
      .value.toLowerCase();
    const taskElements = document.querySelectorAll(".task");
  
    taskElements.forEach((taskElement) => {
      const titleText = taskElement.querySelector("h3").textContent.toLowerCase();
      const descriptionText = taskElement
        .querySelector("p")
        .textContent.toLowerCase();
  
      if (
        titleText.includes(searchTerm) ||
        descriptionText.includes(searchTerm)
      ) {
        taskElement.style.display = "";
      } else {
        taskElement.style.display = "none";
      }
    });
}

/**
 * Filters tasks based on user input.
 */
function filterTasks() {
    const searchTerm = document.getElementById("findTask").value.toLowerCase();
    const taskElements = document.querySelectorAll(".task");
  
    taskElements.forEach((taskElement) => {
      const titleText = taskElement.querySelector("h3").textContent.toLowerCase();
      const descriptionText = taskElement
        .querySelector("p")
        .textContent.toLowerCase();
  
      if (
        titleText.includes(searchTerm) ||
        descriptionText.includes(searchTerm)
      ) {
        taskElement.style.display = "";
      } else {
        taskElement.style.display = "none";
      }
    });
}

/**
 * Updates a subtask's text in local storage and synchronizes it with Firebase.
 * 
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} newText - The new text for the subtask.
 */
function updateSubtaskInLocalStorage(taskId, subtaskIndex, newText) {
    const savedStatuses =
      JSON.parse(localStorage.getItem(`task-${taskId}-subtasks`)) || [];
  
    while (savedStatuses.length <= subtaskIndex) {
      savedStatuses.push(false);
    }
  
    const existingSubtasks =
      JSON.parse(localStorage.getItem(`task-${taskId}-subtask-texts`)) || [];
    existingSubtasks[subtaskIndex] = newText.trim();
    localStorage.setItem(
      `task-${taskId}-subtask-texts`,
      JSON.stringify(existingSubtasks)
    );
  
    updateSubtasksInFirebase(taskId);
}
