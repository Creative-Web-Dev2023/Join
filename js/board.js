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

function loadTasks() {
    const tasksData = JSON.parse(localStorage.getItem('kanbanTasks'));
    if (!tasksData) return;

    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
        const columnId = column.querySelector('h2').textContent.trim();
        const contentDiv = column.querySelector('.content');
        contentDiv.innerHTML = '';  // Clear existing tasks

        if (tasksData[columnId]) {
            tasksData[columnId].forEach(taskData => {
                if (!document.getElementById(taskData.id)) {
                    const task = document.createElement('div');
                    task.classList.add('task');
                    task.id = taskData.id;
                    task.draggable = true;
                    task.innerHTML = taskData.content;
                    task.setAttribute('ondragstart', 'drag(event)');

                    contentDiv.appendChild(task);
                }
            });
        }
        updateNoTasksMessage(column); // Update the no-tasks message
    });
}

function saveTasks() {
    const columns = document.querySelectorAll('.kanban-column');
    const tasksData = {};

    columns.forEach(column => {
        const columnId = column.querySelector('h2').textContent.trim();
        tasksData[columnId] = [];
        const tasks = column.querySelectorAll('.task');

        tasks.forEach(task => {
            tasksData[columnId].push({
                id: task.id,
                content: task.innerHTML
            });
        });
    });

    localStorage.setItem('kanbanTasks', JSON.stringify(tasksData));
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


