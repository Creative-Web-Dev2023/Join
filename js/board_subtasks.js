
  /**
   * Displays the edit popup for a task.
   * 
   * @param {number} taskId - The ID of the task.
   * @param {Object} taskData - The data of the task to display in the popup.
   * @param {string} assignedHtml - The HTML content representing the assigned people.
   */
  function displayEditPopup(taskId, taskData, assignedHtml) {
    document.getElementById(`popup-task${taskId}`).style.height = "80%";
    const edit = document.getElementById(`popup-task${taskId}`);
    edit.innerHTML = HtmlEdit(
      taskData.titleText,
      taskData.descriptionText,
      taskId,
      assignedHtml,
      taskData.dueDate,
      taskData.priorityText,
      taskData.userStoryText
    );
  }
  
  /**
   * Loads subtasks into the edit form.
   * 
   * @param {number} taskId - The ID of the task.
   * @param {string} subtaskText - The subtasks as a comma-separated string.
   */
  function loadSubtasksIntoEditForm(taskId, subtaskText) {
    if (typeof subtaskText === "string") {
      const subtasks = subtaskText
        .split(",")
        .filter((subtask) => subtask.trim() !== "");
      populateSubtaskList(taskId, subtasks);
    } else {
      console.error("subtaskText is not a string:", subtaskText);
    }
  }
  
  /**
   * Populates the subtask list in the edit form.
   * 
   * @param {number} taskId - The ID of the task.
   * @param {Array<string>} subtasks - An array of subtask strings.
   */
  function populateSubtaskList(taskId, subtasks) {
    const subtaskList = document.getElementById("subtask-list");
    subtaskList.innerHTML = subtasks
      .map(
        (subtask, index) => `
            <div id="subtask-${index}" style="display: flex; align-items: center;">
                <p class="subtask" contenteditable="true" style="flex-grow: 1;">${subtask.trim()}</p>
                <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtasks(${index})">
            </div>
        `
      )
      .join("");
  
    subtasks.forEach((_, index) => addSubtaskInputListener(taskId, index));
  }
  
  /**
   * Updates the subtasks in Firebase for a given task.
   * 
   * @param {number} taskId - The ID of the task.
   */
  function updateSubtasksInFirebase(taskId) {
    const newSubtasks = Array.from(
      document.querySelectorAll("#subtask-list .subtask")
    ).map((p) => p.textContent.trim());
  
    const combinedSubtasks = newSubtasks.filter(
      (subtask) => subtask.trim() !== ""
    );
  
    putData(`tasks/task${taskId}/subtask`, combinedSubtasks.join(",")).catch(
      (error) => {
        console.error("Error updating subtasks in Firebase:", error);
      }
    );
  }
  
  /**
   * Adds a new subtask to the list and updates Firebase.
   * 
   * @param {number} taskId - The ID of the task.
   */
  function addSubtasks(taskId) {
    const subtaskText = getSubtaskInputValue();
    if (!subtaskText) return;
  
    const index = appendSubtaskToList(taskId, subtaskText);
    clearSubtaskInput();
    updateSubtasksInFirebase(taskId);
  
    updateProgress(taskId);
  }
  
  /**
   * Retrieves the value of the subtask input field.
   * 
   * @returns {string} - The trimmed value of the subtask input field.
   */
  function getSubtaskInputValue() {
    const input = document.getElementById("subtask-input");
    return input.value.trim();
  }
  
  /**
   * Appends a subtask to the list in the edit form.
   * 
   * @param {number} taskId - The ID of the task.
   * @param {string} subtaskText - The text of the subtask to add.
   * @returns {number} - The index of the added subtask.
   */
  function appendSubtaskToList(taskId, subtaskText) {
    const subtaskList = document.getElementById("subtask-list");
    const index = subtaskList.children.length;
  
    const subtaskItem = createSubtaskElement(index, subtaskText);
    addInputListener(taskId, index, subtaskItem);
  
    subtaskList.appendChild(subtaskItem);
    return index;
  }
  
  /**
   * Creates a subtask element for the edit form.
   * 
   * @param {number} index - The index of the subtask.
   * @param {string} subtaskText - The text of the subtask.
   * @returns {HTMLElement} - The subtask element.
   */
  function createSubtaskElement(index, subtaskText) {
    const subtaskItem = document.createElement("div");
    subtaskItem.id = `subtask-${index}`;
    subtaskItem.style.display = "flex";
    subtaskItem.style.alignItems = "center";
    subtaskItem.innerHTML = `
            <p class="subtask" contenteditable="true" style="flex-grow: 1;">${subtaskText}</p>
            <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtasks(${index})">
        `;
    return subtaskItem;
  }
  
  /**
   * Clears the subtask input field.
   */
  function clearSubtaskInput() {
    document.getElementById("subtask-input").value = "";
  }
  
  /**
   * Removes a subtask from the list and Firebase.
   * 
   * @param {number} index - The index of the subtask to remove.
   */
  function removeSubtasks(index) {
    const subtaskElement = document.getElementById(`subtask-${index}`);
    const subtaskText = subtaskElement.querySelector(".subtask").textContent;
  
    if (subtaskElement) {
      subtaskElement.remove();
      deleteSubTaskFB(`tasks/task${currentTaskData.taskId}`, subtaskText);
    }
  }
  
  /**
   * Deletes a subtask from Firebase.
   * 
   * @param {string} path - The path to the task in Firebase.
   * @param {string} subtaskToDelete - The text of the subtask to delete.
   * @returns {Promise<void>}
   */
  async function deleteSubTaskFB(path, subtaskToDelete) {
    const taskData = await fetchTaskDataFromFirebase(path);
    if (!isValidTaskData(taskData)) return;
  
    const updatedSubtasks = removeSubtask2(taskData.subtask, subtaskToDelete);
    if (updatedSubtasks === taskData.subtask) return;
  
    return await updateSubtasksInFirebase2(path, updatedSubtasks);
  }
  
  /**
   * Fetches task data from Firebase.
   * 
   * @param {string} path - The path to the task in Firebase.
   * @returns {Promise<Object>} - The fetched task data.
   */
  async function fetchTaskDataFromFirebase(path) {
    const response = await fetch(BASE_URL + path + ".json");
    return await response.json();
  }
  
  /**
   * Checks if the task data is valid.
   * 
   * @param {Object} taskData - The task data to validate.
   * @returns {boolean} - Whether the task data is valid.
   */
  function isValidTaskData(taskData) {
    return taskData && taskData.subtask;
  }
  
  /**
   * Removes a subtask from a comma-separated string of subtasks.
   * 
   * @param {string} subtasksString - The original subtask string.
   * @param {string} subtaskToDelete - The subtask to remove.
   * @returns {string} - The updated subtask string.
   */
  function removeSubtask2(subtasksString, subtaskToDelete) {
    const subtasks = subtasksString.split(",");
    return subtasks
      .filter((subtask) => subtask.trim() !== subtaskToDelete.trim())
      .join(",");
  }
  
  /**
   * Updates the subtasks in Firebase after removing a subtask.
   * 
   * @param {string} path - The path to the task in Firebase.
   * @param {string} updatedSubtasks - The updated subtask string.
   * @returns {Promise<Object>} - The response from Firebase.
   */
  async function updateSubtasksInFirebase2(path, updatedSubtasks) {
    const response = await fetch(BASE_URL + path + ".json", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subtask: updatedSubtasks }),
    });
  
    return await response.json();
  }
  
  /**
   * Filters out a subtask from a comma-separated string of subtasks.
   * 
   * @param {string} subtaskString - The original subtask string.
   * @param {string} subtaskToDelete - The subtask to remove.
   * @returns {string} - The filtered subtask string.
   */
  function filterSubtasks(subtaskString, subtaskToDelete) {
    return subtaskString
      .split(",")
      .filter((subtask) => subtask.trim() !== subtaskToDelete.trim());
  }
  
  /**
   * Updates subtasks in Firebase with a new subtask string.
   * 
   * @param {string} path - The path to the task in Firebase.
   * @param {string} updatedSubtaskString - The updated subtask string.
   * @returns {Promise<Object>} - The response from Firebase.
   */
  async function updateSubtasks(path, updatedSubtaskString) {
    const response = await fetch(BASE_URL + path + ".json", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtask: updatedSubtaskString }),
    });
    return await response.json();
  }
  