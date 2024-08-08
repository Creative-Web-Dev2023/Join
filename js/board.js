document.addEventListener('DOMContentLoaded', loadTasks);

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const task = document.getElementById(data);

    let targetColumn = event.target.closest('.kanban-column');
    if (targetColumn) {
        const sourceColumn = task.closest('.kanban-column');
        targetColumn.querySelector('.content').appendChild(task);
        updateNoTasksMessage(sourceColumn); // Update source column
        updateNoTasksMessage(targetColumn); // Update target column
        saveTasks();
    }
}

function saveTasks() {
    const columns = document.querySelectorAll('.kanban-column');
    const tasksData = {};

    columns.forEach((column, index) => {
        const tasks = column.querySelectorAll('.task');
        tasksData[`column${index}`] = Array.from(tasks).map(task => task.id);
    });

    localStorage.setItem('tasksPositions', JSON.stringify(tasksData));
}

function loadTasks() {
    const tasksData = JSON.parse(localStorage.getItem('tasksPositions'));

    if (tasksData) {
        Object.keys(tasksData).forEach(columnKey => {
            const columnIndex = columnKey.replace('column', '');
            const column = document.querySelectorAll('.kanban-column')[columnIndex];
            const taskIds = tasksData[columnKey];

            taskIds.forEach(taskId => {
                const task = document.getElementById(taskId);
                if (task) {
                    column.querySelector('.content').appendChild(task);
                }
            });

            updateNoTasksMessage(column); // Ensure correct message display
        });
    }
}



function updateNoTasksMessage(column) {
    const tasks = column.querySelectorAll('.task');
    const noTasksMessage = column.querySelector('.no-tasks');

    if (tasks.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }
}

function showPopup() {
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    popup.classList.add("show");
}

function hidePopup() {
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");
    popup.classList.remove("show");
    setTimeout(function () {
        overlay.style.display = "none";
    }, 500);
}

// Initialisiere die Event-Handler
function initializePopupHandlers() {
    const closeButton = document.getElementById("closeButton");
    const overlay = document.getElementById("overlay");

    closeButton.addEventListener("click", hidePopup);
    overlay.addEventListener("click", hidePopup);
}

function deleteTask(event) {
    let taskElement = event.target.closest('.popup-task');
    if (taskElement) {
        taskElement.parentNode.removeChild(taskElement);
    } else {
        console.log('Task element not found');
    }
}

function editTask() {
    // Den Bearbeitungsbereich laden
    const editContent = `
        <div class="format-sections">
            <form>
                <div class="first-container">
                    <div class="first-container-formatted part-1">
                        <label for="title">Title <span class="red">*</span></label>
                        <input id="title-input" class="input-style-1" placeholder="Enter a title" type="text">
                    </div>
                    <div class="first-container-formatted part-2">
                        <label for="description">Description</label>
                        <textarea id="description-input" class="input-style-2" placeholder="Enter a Description"
                            type="text"></textarea>
                    </div>
                    <div class="first-container-formatted part-3">
                        <label for="assigned to">Assigned To</label>
                        <div class="dropdown-format">
                            <div class="dropdown-toggle dropdown-start" onclick="toggleDropdown()">
                                <span class="dropdown-start">Select contacts to assign</span>
                                <span class="dropdown-start">▼</span>
                            </div>
                            <div class="dropdown-content" id="dropdown-content">
                            </div>
                        </div>
                        <div id="selected-contacts-container" class="selected-contacts"></div>
                    </div>
                </div>
            </form>

            <div class="line"></div>
            <div class="second-section">
                <form>
                    <div class="first-container">
                        <div class="first-container-formatted part-1">
                            <label for="due-date">Due date <span class="red">*</span></label>
                            <input id="date" class="input-style-1" placeholder="dd/mm/yyyy" type="date" min="1997-01-01"
                                max="2030-12-31">
                        </div>
                        <div>
                            <label for="prio">Prio</label>
                            <div class="prio-buttons">
                                <img class="prio-button" id="urgent" src="/assets/img/img_add_task/urgent_standart.png"
                                    alt="Urgent">
                                <img class="prio-button" id="medium" src="/assets/img/img_add_task/medium_standart.png"
                                    alt="Medium">
                                <img class="prio-button" id="low" src="/assets/img/img_add_task/low_standart.png"
                                    alt="Low">
                            </div>
                        </div>

                        <div class="first-container-formatted part-2">
                            <label for="category">Category <span class="red">*</span></label>
                            <select id="category" name="Selects contacts to assign" id="">
                                <option value="" disabled selected>Select Task Category</option>
                                <option>Technical Task</option>
                                <option>User Story</option>
                            </select>
                        </div>
                        <div class="first-container-formatted part-3 space subtask-container">
                            <label for="subtask">Subtasks</label>
                            <div class="input-wrapper">
                                <input class="input-style-1 img-for-subtask" placeholder="Add new subtask" type="text"
                                    id="subtask-input">
                                <div id="add-subtask-btn" onclick="addSubtask()"></div>
                            </div>
                            <ul id="subtask-list" class="subtask-list"></ul>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="bottom-section">
            <div>
                <p><span class="red">*</span>This field is required</p>
            </div>
            <div class="buttons">
                <button class="clear" onclick="resetInput()">Clear <img src="/assets/img/img_add_task/cross.png"
                        alt=""></button>
                <button class="create" onclick="count(); error()">Create Task <img src="/assets/img/img_add_task/check.png"
                        alt=""></button>
            </div>
        </div>
    `;

    // Den Inhalt des Popups aktualisieren
    document.querySelector('.popup-content-task').innerHTML = editContent;

    // Das Popup anzeigen
    document.getElementById('popup-task').style.right = '0';

    // Das Overlay anzeigen
    document.getElementById('overlay-task').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.right = '-100%';
    document.getElementById('overlay').style.display = 'none';
}


