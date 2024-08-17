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
