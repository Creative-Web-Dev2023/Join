/**
 * Adds event listeners to filter tasks based on user input.
 */
document.getElementById("findTask").addEventListener("input", filterTasks);
document.getElementById("findTaskResponsive").addEventListener("input", filterTaskss);

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
