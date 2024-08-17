/**
 * Generates the HTML for a dropdown item with the given name, color, and emblem.
 *
 * @param {string} name - The name of the contact.
 * @param {string} color - The background color for the contact's emblem.
 * @param {string} emblem - The emblem or initial of the contact.
 * @return {string} - The generated HTML for the dropdown item.
 */
function displayNameColor(name, color, emblem) {
  return `
          <div class="dropdown-item" data-selected="false" onclick="toggleSelection(this)">
              <div class="circle" style="background-color:${color};"></div>
              <span class="chosenName">${name}</span>
              <span class="toggle-image" src="/assets/img/img_add_task/checkbox.png" alt="Unselected"></span>
          </div>
      `;
}

/**
 * Toggles the visibility of the dropdown for selecting contacts.
 *
 * @param {number} taskId - The ID of the task for which the dropdown is being toggled.
 */
function toggleDropdown(taskId) {
  selctedAssignees(taskId);
  const dropdownContent = document.getElementById("dropdown-content");
  dropdownContent.style.display =
    dropdownContent.style.display === "block" ? "none" : "block";
}

/**
 * Toggles the visibility of the dropdown for selecting contacts.
 */
function toggleDropdowns() {
  const dropdownContent = document.getElementById("dropdown-content");
  dropdownContent.style.display =
    dropdownContent.style.display === "block" ? "none" : "block";
}

/**
 * Closes the dropdown when clicking outside of it.
 *
 * @param {MouseEvent} event - The mouse click event.
 */
window.onclick = function (event) {
  const dropdownContent = document.getElementById("dropdown-content");
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  if (
    dropdownContent.style.display === "block" &&
    !dropdownContent.contains(event.target) &&
    !dropdownToggle.contains(event.target)
  ) {
    dropdownContent.style.display = "none";
  }
};

/**
 * Toggles the selection of a dropdown item, updates the style, and refreshes the selected contacts list.
 *
 * @param {HTMLElement} item - The dropdown item being selected or deselected.
 */
function toggleSelection(item) {
  const isSelected = item.getAttribute("data-selected") === "true";
  item.setAttribute("data-selected", !isSelected);
  const img = item.querySelector(".toggle-image");
  if (!isSelected) {
    img.src = "/assets/img/img_add_task/checkedbox.png";
    img.alt = "Selected";
    item.style.backgroundColor = "#2A3647";
    item.style.color = "white";
  } else {
    img.src = "/assets/img/img_add_task/checkbox.png";
    item.style.backgroundColor = "";
    item.style.color = "";
  }
  getSelectedContacts();
}

/**
 * Adds a new subtask to the task and displays it in the subtask list.
 *
 * @param {number} taskId - The ID of the task to which the subtask is being added.
 */
function addSubtask(taskId) {
  const subtaskText = getSubtaskInput();
  if (!subtaskText) return;

  const subtasks = parseSubtaskText(subtaskText);
  const subtaskList = document.getElementById("subtask-list");

  subtasks.forEach((subtask) => {
    const subtaskItem = createSubtaskItem(subtask, taskId);
    subtaskList.appendChild(subtaskItem);
  });

  clearSubtaskInput();
  handleSubtaskUpdates(taskId);
}

/**
 * Retrieves the subtask input text from the input field.
 *
 * @return {string} - The trimmed subtask text.
 */
function getSubtaskInput() {
  const input = document.getElementById("subtask-input");
  return input.value.trim();
}

/**
 * Splits and parses the subtask text input into individual subtasks.
 *
 * @param {string} subtaskText - The raw subtask text input.
 * @return {Array<string>} - An array of individual subtask strings.
 */
function parseSubtaskText(subtaskText) {
  return subtaskText.split("\n").filter((subtask) => subtask.trim() !== "");
}

/**
 * Creates a list item for a subtask and adds event listeners for editing and deletion.
 *
 * @param {string} subtask - The subtask text.
 * @param {number} taskId - The ID of the task to which the subtask belongs.
 * @return {HTMLElement} - The created subtask list item.
 */
function createSubtaskItem(subtask, taskId) {
  const subtaskItem = document.createElement("li");
  subtaskItem.className = "list";
  subtaskItem.contentEditable = "true";
  subtaskItem.innerHTML = `
        <p class="subtask">${subtask.trim()}</p>
        <img class="trash" src="/assets/img/delete.png">
      `;
  addSubtaskListeners(subtaskItem, taskId);
  return subtaskItem;
}

/**
 * Adds event listeners to a subtask item for editing and deleting.
 *
 * @param {HTMLElement} subtaskItem - The subtask item to which listeners are added.
 * @param {number} taskId - The ID of the task to which the subtask belongs.
 */
function addSubtaskListeners(subtaskItem, taskId) {
  subtaskItem.querySelector(".trash").addEventListener("click", (event) => {
    deleteSubtask(event, taskId);
  });
  subtaskItem.addEventListener("input", () => {
    updateSubtasks(taskId);
  });
}

/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
  document.getElementById("subtask-input").value = "";
}

/**
 * Handles subtask updates, including pushing subtasks to the list, updating progress, and saving to Firebase.
 *
 * @param {number} taskId - The ID of the task to which the subtasks belong.
 */
function handleSubtaskUpdates(taskId) {
  pushsubtasks();
  updateProgress(taskId);
  saveSubtaskProgress(taskId);
}

/**
 * Pushes the subtasks to the global subtask array and updates the current task's progress.
 */
function pushsubtasks() {
  subtask = [];
  const subtaskElements = document.querySelectorAll(".subtask");
  subtaskElements.forEach((element) => {
    subtask.push(element.innerHTML);
  });
  listtask = [...subtask];
  updateProgress(currentTaskData.taskId);
  saveSubtaskProgress(currentTaskData.taskId);
}

/**
 * Updates the subtask array when changes are made and updates progress for the given task.
 *
 * @param {number} taskId - The ID of the task to which the subtasks belong.
 */
function updateSubtasks(taskId) {
  const subtaskElements = document.querySelectorAll(".subtask");
  subtask = [];
  subtaskElements.forEach((element) => {
    subtask.push(element.innerHTML.trim());
  });
  listtask = [...subtask];
  updateProgress(taskId);
  saveSubtaskProgress(taskId);
}

/**
 * Deletes a subtask from the task when the trash icon is clicked.
 *
 * @param {MouseEvent} event - The click event triggered by the trash icon.
 * @param {number} taskId - The ID of the task to which the subtask belongs.
 */
function deleteSubtask(event, taskId) {
  const subtaskItem = event.target.parentElement;
  subtaskItem.remove();
  pushsubtasks();
  updateProgress(taskId);
  saveSubtaskProgress(taskId);
}

/**
 * Adds a new subtask to the list and displays it. Clears the input after adding.
 */
function pushAndDisplaySubtask() {
  const input = document.getElementById("subtask-input");
  const subtaskText = input.value.trim();
  if (subtaskText === "") return;
  subtask.push(subtaskText);
  listtask = [...subtask];
  displaySubtasks();
  input.value = "";
}

/**
 * Displays all subtasks in the subtask list.
 */
function displaySubtasks() {
  const subtaskList = document.getElementById("subtask-list");
  subtaskList.innerHTML = "";
  subtask.forEach((task, index) => {
    const subtaskItem = document.createElement("li");
    subtaskItem.className = "list";
    subtaskItem.innerHTML = `
              <p class="subtask" contenteditable="true" oninput="updateSubtaskText(event, ${index})">${task}</p>
              <img class="trash" src="/assets/img/delete.png" onclick="removeSubtask(${index})">
          `;
    subtaskList.appendChild(subtaskItem);
  });
}

/**
 * Updates the text of a subtask in the global subtask array when edited.
 *
 * @param {Event} event - The input event triggered by editing the subtask.
 * @param {number} index - The index of the subtask being updated.
 */
function updateSubtaskText(event, index) {
  const updatedText = event.target.textContent.trim();
  subtask[index] = updatedText;
  listtask = [...subtask];
}

/**
 * Removes a subtask from the subtask array and updates the displayed list.
 *
 * @param {number} index - The index of the subtask to remove.
 */
function removeSubtask(index) {
  subtask.splice(index, 1);
  listtask = [...subtask];
  displaySubtasks();
}
