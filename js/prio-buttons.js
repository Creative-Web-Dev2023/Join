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
    const maxPeopleToShow = 3;
    let html = "";
  
    // Generate HTML for the first three or fewer people
    assignedPeople.slice(0, maxPeopleToShow).forEach((person) => {
      const initials = person.name
        .split(" ")
        .map((name) => name[0])
        .join("");
      html += `
        <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
          ${initials}
        </span>
      `;
    });
  
    // If there are more than maxPeopleToShow, add the "+x" indicator
    if (assignedPeople.length > maxPeopleToShow) {
      const extraPeopleCount = assignedPeople.length - maxPeopleToShow;
      html += `
        <span class="assignee" style="background-color: #007bff; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
          +${extraPeopleCount}
        </span>
      `;
    }
  
    return html;
  }
  