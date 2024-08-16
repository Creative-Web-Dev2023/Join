/**
 * Adds mouseover, mouseout, and click event listeners to all priority buttons.
 */
document.querySelectorAll(".prio-button").forEach(function (button) {
  button.addEventListener("mouseover", handleMouseOver);
  button.addEventListener("mouseout", handleMouseOut);
  button.addEventListener("click", handleClick);
});

/**
 * Adds event listeners for clicking and dragging tasks.
 *
 * @param {HTMLElement} taskElement - The task element to which the listeners are added.
 * @param {number} index - The index of the task.
 */
function addTaskListeners(taskElement, index) {
  taskElement.addEventListener("click", () => openPopup(index + 1));
  taskElement.addEventListener("dragstart", drag);
}

/**
 * Sets up MutationObservers for each kanban column to observe changes and update progress bars.
 * Also updates the progress bars for existing tasks when the DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  const columns = document.querySelectorAll(".kanban-column .content");

  columns.forEach((column) => {
    const observer = new MutationObserver(() => {
      const tasks = column.querySelectorAll(".task");
      tasks.forEach((task) => {
        const taskId = task.id.replace("task", "");
        updateProgressBarFromFirebase(taskId);
      });
    });
    observer.observe(column, { childList: true });

    const tasks = column.querySelectorAll(".task");
    tasks.forEach((task) => {
      const taskId = task.id.replace("task", "");
      updateProgressBarFromFirebase(taskId);
    });
  });
});

/**
 * Opens the task edit popup, fetches the task data, and adds event listeners to priority buttons.
 *
 * @async
 * @param {number} taskId - The ID of the task to be edited.
 */
async function openEdit(taskId) {
  await selctedAssignees(taskId);
  const taskData = await fetchTaskData(taskId);
  const assignedHtml = generateAssignedHtml(taskData.assignedPeople);

  displayEditPopup(taskId, taskData, assignedHtml);
  loadSubtasksIntoEditForm(taskId, taskData.subtaskText);

  document.querySelectorAll(".prio-button").forEach(function (button) {
    button.addEventListener("mouseover", handleMouseOver);
    button.addEventListener("mouseout", handleMouseOut);
    button.addEventListener("click", handleClick);
  });
}

/**
 * Adds an input listener to a subtask element, which updates the subtask's content in local storage.
 *
 * @param {number} taskId - The ID of the task containing the subtask.
 * @param {number} index - The index of the subtask.
 * @param {HTMLElement} subtaskItem - The subtask element.
 */
function addInputListener(taskId, index, subtaskItem) {
  const subtaskElement = subtaskItem.querySelector(".subtask");
  subtaskElement.addEventListener("input", () =>
    updateSubtaskInLocalStorage(taskId, index, subtaskElement.textContent)
  );
}

/**
 * Adds an input listener to a subtask element by its index, which updates the subtask's content in local storage.
 *
 * @param {number} taskId - The ID of the task containing the subtask.
 * @param {number} index - The index of the subtask.
 */
function addSubtaskInputListener(taskId, index) {
  const subtaskElement = document.querySelector(`#subtask-${index} .subtask`);
  subtaskElement.addEventListener("input", () =>
    updateSubtaskInLocalStorage(taskId, index, subtaskElement.textContent)
  );
}

/**
 * Initializes the kanban board by loading necessary information and task data.
 */
function init12() {
  getInfo();
  loadBoard();
}

/**
 * Creates a task element, generates its content, and adds event listeners to it.
 *
 * @param {Object} task - The task data object.
 * @param {number} index - The index of the task.
 * @return {HTMLElement} - The created task element.
 */
function createTaskElement(task, index) {
  const { category, title, description, subtask, assigned, priority } = task;
  const taskElement = createTaskDiv(index);
  const taskContent = generateTaskContent(
    category,
    title,
    description,
    subtask,
    assigned,
    priority,
    index
  );

  taskElement.innerHTML = taskContent;
  addTaskListeners(taskElement, index);

  return taskElement;
}

/**
 * Generates the HTML content for a task element.
 *
 * @param {string} category - The category of the task.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} subtask - The subtasks of the task.
 * @param {Array} assigned - The list of assigned people.
 * @param {string} priority - The priority level of the task.
 * @param {number} index - The index of the task.
 * @return {string} - The generated HTML content for the task.
 */
function generateTaskContent(
  category,
  title,
  description,
  subtask,
  assigned,
  priority,
  index
) {
  const userStoryText = category;
  const titleText = title || "Title";
  const descriptionText = description || "Description";
  const subtasks = parseSubtasks(subtask);
  const subtaskCount = subtasks.length;
  const priorityImage = getPriorityImage(priority);

  return HtmlTaskElement(
    getHeaderColor(userStoryText),
    userStoryText,
    titleText,
    descriptionText,
    subtaskCount ? HtmlProgressBar(index, subtaskCount) : "",
    generateAssignedHtml(assigned || []),
    priorityImage
  );
}

/**
 * Parses a comma-separated string of subtasks into an array.
 *
 * @param {string} subtask - The comma-separated string of subtasks.
 * @return {Array<string>} - An array of non-empty subtasks.
 */
function parseSubtasks(subtask) {
  return subtask ? subtask.split(",").filter((st) => st.trim() !== "") : [];
}

/**
 * Handles the mouseover event for a priority button, changing its image to the hover state.
 */
function handleMouseOver() {
  if (!this.classList.contains("clicked")) {
    const hoverSrc = this.src.replace("_standart", "_hover");
    this.src = hoverSrc;
  }
}

/**
 * Handles the mouseout event for a priority button, reverting its image to the standard state.
 */
function handleMouseOut() {
  if (!this.classList.contains("clicked")) {
    const standartSrc = this.src.replace("_hover", "_standart");
    this.src = standartSrc;
  }
}

/**
 * Handles the click event for priority buttons, updating the clicked state and image accordingly.
 */
function handleClick() {
  document.querySelectorAll(".prio-button").forEach(function (btn) {
    if (btn !== this) {
      btn.classList.remove("clicked");
      if (btn.src.includes("_clicked")) {
        btn.src = btn.src.replace("_clicked", "_standart");
      }
    }
  }, this);

  this.classList.add("clicked");
  if (this.src.includes("_hover") || this.src.includes("_standart")) {
    this.src = this.src.replace(/_hover|_standart/, "_clicked");
  }
}

/**
 * Returns the URL of the image corresponding to the task's priority level.
 *
 * @param {string} priority - The priority level (e.g., "urgent", "medium", "low").
 * @return {string} - The image URL for the corresponding priority level.
 */
function getPriorityImage(priority) {
  const priorities = {
    urgent: "/assets/img/img_board/urgent.png",
    medium: "/assets/img/img_board/medium.png",
    low: "/assets/img/img_board/low.png",
  };
  return (
    priorities[priority?.toLowerCase()] || "/assets/img/img_board/default.png"
  );
}

/**
 * Creates a new task div element with a unique ID and sets it as draggable.
 *
 * @param {number} index - The index of the task.
 * @return {HTMLElement} - The created task div element.
 */
function createTaskDiv(index) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.draggable = true;
  taskDiv.id = `task${index + 1}`;
  return taskDiv;
}

/**
 * Returns the appropriate header color based on the task category.
 *
 * @param {string} userStoryText - The task category (e.g., "Technical Task", "User Story").
 * @return {string} - The color corresponding to the task category.
 */
function getHeaderColor(userStoryText) {
  const colors = {
    "Technical Task": "#1FD7C1",
    "User Story": "#0038FF",
  };
  return colors[userStoryText] || "#FFF";
}

/**
 * Generates the HTML for displaying assigned people as circles with initials.
 *
 * @param {Array<Object>} assignedPeople - An array of people assigned to the task, each with a name and color.
 * @return {string} - The HTML string representing the assigned people.
 */
function generateAssignedHtml(assignedPeople) {
  return assignedPeople
    .map((person) => {
      const initials = person.name
        .split(" ")
        .map((name) => name[0])
        .join("");
      return `
              <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
                  ${initials}
              </span>
          `;
    })
    .join("");
}

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
  