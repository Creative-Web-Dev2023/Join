/**
 * Retrieves the statuses of subtasks by checking their associated images.
 * 
 * @param {number} taskId - The ID of the task whose subtasks are being checked.
 * @returns {boolean[]} - An array of boolean values representing the subtask statuses.
 */
function getSubtaskStatuses(taskId) {
    const subtaskImages = document.querySelectorAll(
      `#popup-task${taskId} .subtask img`
    );
    return Array.from(subtaskImages).map((img) =>
      img.src.includes("checkesbox.png")
    );
  }
  
  /**
   * Generates the Firebase path for subtask statuses.
   * 
   * @param {number} taskId - The ID of the task whose subtask statuses are being saved.
   * @returns {string} - The Firebase path for subtask statuses.
   */
  function generateFirebaseSubtaskPath(taskId) {
    return `tasks/task${taskId}/subtaskStatuses.json`;
  }
  
  /**
   * Sends the subtask statuses to Firebase.
   * 
   * @param {string} firebasePath - The Firebase path to save the subtask statuses.
   * @param {boolean[]} subtaskStatuses - The array of subtask statuses to be saved.
   * @returns {Promise<void>}
   */
  async function sendSubtaskStatusesToFirebase(firebasePath, subtaskStatuses) {
    await fetch(BASE_URL + firebasePath, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subtaskStatuses),
    });
  }
  
  /**
   * Handles errors when saving subtask statuses to Firebase.
   * 
   * @param {Error} error - The error object.
   */
  function handleSaveError(error) {
    console.error("Error saving subtask statuses to Firebase:", error);
  }
  
  /**
   * Loads the subtask progress for a task and applies saved statuses.
   * 
   * @param {number} taskId - The ID of the task to load subtask progress for.
   * @returns {Promise<void>}
   */
  async function loadSubtaskProgress(taskId) {
    const savedStatuses = await getSavedStatusesFromFirebase(taskId);
    const subtaskImages = getSubtaskImages(taskId);
  
    if (!savedStatuses || savedStatuses.length === 0) {
      const initialStatuses = Array(subtaskImages.length).fill(false);
      await saveSubtaskProgress(taskId, initialStatuses);
      applySavedStatuses(subtaskImages, initialStatuses);
    } else {
      applySavedStatuses(subtaskImages, savedStatuses);
    }
  
    updateProgressBarFromFirebase(taskId);
  }
  
  /**
   * Fetches saved subtask statuses from Firebase.
   * 
   * @param {number} taskId - The ID of the task to fetch the subtask statuses for.
   * @returns {Promise<boolean[]>} - The array of saved subtask statuses.
   */
  async function getSavedStatusesFromFirebase(taskId) {
    const response = await fetch(
      BASE_URL + `tasks/task${taskId}/subtaskStatuses.json`
    );
    const savedStatuses = await response.json();
    return savedStatuses || [];
  }
  
  /**
   * Applies saved subtask statuses to the task's subtask images.
   * 
   * @param {NodeListOf<Element>} subtaskImages - The subtask images to update.
   * @param {boolean[]} savedStatuses - The saved statuses to apply.
   */
  function applySavedStatuses(subtaskImages, savedStatuses) {
    subtaskImages.forEach((img, index) => {
      img.src = savedStatuses[index]
        ? "/assets/img/img_add_task/checkesbox.png"
        : "/assets/img/img_add_task/checkbox.png";
    });
  }
  
  /**
   * Fetches tasks from Firebase.
   * 
   * @returns {Promise<Object[]>} - An array of task objects fetched from Firebase.
   */
  async function fetchTasks() {
    try {
      const response = await fetch(BASE_URL + "tasks.json");
      const data = await response.json();
  
      if (!data) {
        console.error("No tasks data found");
        return [];
      }
  
      const tasks = Object.keys(data).map((taskId) => ({
        id: taskId,
        ...data[taskId],
      }));
  
      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }
  
  /**
   * Opens the task popup and loads the task data.
   * 
   * @param {number} taskId - The ID of the task to open the popup for.
   * @returns {Promise<void>}
   */
  async function openPopup(taskId) {
    const taskData = await fetchTaskData(taskId);
    currentTaskData = { taskId, ...taskData };
  
    document.body.style.overflowY = "hidden";
    const assignedHtml = generateAssignedHtml2(taskData.assignedPeople);
    const subtasksHtml = generateSubtasksHtml(taskData.subtaskText, taskId);
    const priorityImage = getPriorityImage(taskData.priorityText);
    const headerBackgroundColor = getHeaderBackgroundColor(taskData.userStoryText);
  
    displayPopup(
      taskId,
      headerBackgroundColor,
      taskData,
      priorityImage,
      assignedHtml,
      subtasksHtml
    );
  
    await loadSubtaskProgress(taskId);
  }
  
  /**
   * Fetches the data for a specific task from Firebase.
   * 
   * @param {number} taskId - The ID of the task to fetch data for.
   * @returns {Promise<Object>} - The fetched task data.
   */
  async function fetchTaskData(taskId) {
    const [
      userStoryText,
      titleText,
      dueDate,
      descriptionText,
      subtaskText,
      priorityText,
      assignedPeople,
    ] = await Promise.all([
      userStory(`tasks/task${taskId}/category`),
      title(`tasks/task${taskId}/title`),
      dateFB(`tasks/task${taskId}/date`),
      descriptionFB(`tasks/task${taskId}/description`),
      subtaskFB(`tasks/task${taskId}/subtask`),
      priorityFB(`tasks/task${taskId}/priority`),
      assignedFB(`tasks/task${taskId}/assigned`),
    ]);
    return {
      userStoryText,
      titleText,
      dueDate,
      descriptionText,
      subtaskText,
      priorityText,
      assignedPeople: assignedPeople || [],
    };
  }
  
  /**
   * Generates the HTML for displaying subtasks in the popup.
   * 
   * @param {string|string[]} subtaskText - The subtasks as a string or array.
   * @param {number} taskId - The ID of the task containing the subtasks.
   * @returns {string} - The generated HTML for the subtasks.
   */
  function generateSubtasksHtml(subtaskText, taskId) {
    const subtasks = Array.isArray(subtaskText)
      ? subtaskText
      : subtaskText.split(",").filter((subtask) => subtask.trim() !== "");
    if (subtasks.length === 0) return "<p>No subtasks available.</p>";
    return subtasks
      .map(
        (subtask, index) => `
            <div class="subtask flex" onclick="toggleCheckbox(${index}, ${taskId})">
                <img src="/assets/img/img_add_task/checkbox.png" id="popup-subtask-${index}" name="subtask-${index}" style="height: 16px">
                <label for="popup-subtask-${index}">${subtask.trim()}</label>
            </div>`
      )
      .join("");
  }
  
  /**
   * Retrieves the background color for the task header based on the user story text.
   * 
   * @param {string} userStoryText - The text describing the user story.
   * @returns {string} - The background color for the task header.
   */
  function getHeaderBackgroundColor(userStoryText) {
    const colors = {
      "Technical Task": "#1FD7C1",
      "User Story": "#0038FF",
    };
    return colors[userStoryText] || "#FFF";
  }
  
  /**
   * Displays the task popup with the provided data and HTML content.
   * 
   * @param {number} taskId - The ID of the task.
   * @param {string} headerBackgroundColor - The background color for the task header.
   * @param {Object} taskData - The data for the task.
   * @param {string} priorityImage - The URL of the image representing the task priority.
   * @param {string} assignedHtml - The HTML for the assigned people.
   * @param {string} subtasksHtml - The HTML for the subtasks.
   */
  function displayPopup(
    taskId,
    headerBackgroundColor,
    taskData,
    priorityImage,
    assignedHtml,
    subtasksHtml
  ) {
    const popup = document.getElementById("popup-tasks");
    popup.style.display = "flex";
    popup.innerHTML = HtmlPopup(
      taskId,
      headerBackgroundColor,
      taskData.userStoryText,
      taskData.titleText,
      taskData.descriptionText,
      taskData.dueDate,
      taskData.priorityText,
      priorityImage,
      assignedHtml,
      subtasksHtml
    );
  }
  
  /**
   * Generates the HTML for displaying assigned people in the popup.
   * 
   * @param {Object[]} assignedPeople - An array of people assigned to the task.
   * @returns {string} - The generated HTML for the assigned people.
   */
  function generateAssignedHtml2(assignedPeople) {
    if (assignedPeople.length === 0) return "<p>No one assigned</p>";
    return assignedPeople
      .map((person) => {
        const initials = person.name
          .split(" ")
          .map((name) => name[0])
          .join("");
        return `
            <div>
                <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; text-align: center; color: #fff;">
                    ${initials}
                </span>
                <p>${person.name}<p>
            </div>`;
      })
      .join("");
  }  

let isSaving = false;

/**
 * Toggles the checkbox state for a subtask and saves the updated state to Firebase.
 * 
 * @param {number} index - The index of the subtask.
 * @param {number} taskId - The ID of the task containing the subtask.
 * @returns {Promise<void>}
 */
async function toggleCheckbox(index, taskId) {
    if (isSaving) return;
  
    isSaving = true;
  
    const imgElement = document.getElementById(`popup-subtask-${index}`);
    const isChecked = imgElement.src.includes("checkbox.png");
  
    imgElement.src = isChecked
      ? "/assets/img/img_add_task/checkesbox.png"
      : "/assets/img/img_add_task/checkbox.png";
  
    await saveCheckboxState(taskId, index, !isChecked);
  
    updateProgress(taskId);
  
    isSaving = false;
  }
  
  /**
   * Fetches assigned people for a task and highlights them in the dropdown.
   * 
   * @param {number} taskId - The ID of the task.
   * @returns {Promise<void>}
   */
  async function selctedAssignees(taskId) {
    const assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`);
    resetDropdownItems();
    highlightAssignedPeople(assignedPeople);
  }
  
  /**
   * Resets all dropdown items to their unselected state.
   */
  function resetDropdownItems() {
    document.querySelectorAll(".dropdown-item").forEach((item) => {
      item.setAttribute("data-selected", "false");
      const img = item.querySelector(".toggle-image");
      img.src = "/assets/img/img_add_task/checkbox.png";
      img.alt = "Unselected";
      item.style.backgroundColor = "";
      item.style.color = "";
    });
  }
  
  /**
   * Highlights the dropdown items for the people who are assigned to the task.
   * 
   * @param {Array<Object>} assignedPeople - An array of people assigned to the task.
   */
  function highlightAssignedPeople(assignedPeople) {
    if (!assignedPeople || assignedPeople.length === 0) return;
  
    assignedPeople.forEach((person) => {
      const dropdownItem = document.querySelector(
        `.dropdown-item[data-name="${person.name}"]`
      );
      if (dropdownItem) {
        setItemSelected(dropdownItem);
      }
    });
  }
  
  /**
   * Marks a dropdown item as selected.
   * 
   * @param {HTMLElement} item - The dropdown item element.
   */
  function setItemSelected(item) {
    item.setAttribute("data-selected", "true");
    const img = item.querySelector(".toggle-image");
    img.src = "/assets/img/img_add_task/checkedbox.png";
    img.alt = "Selected";
    item.style.backgroundColor = "#2A3647";
    item.style.color = "white";
  }
  
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
  
    const updatedSubtasks = removeSubtask(taskData.subtask, subtaskToDelete);
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
  function removeSubtask(subtasksString, subtaskToDelete) {
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
  