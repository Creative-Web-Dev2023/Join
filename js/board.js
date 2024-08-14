document.addEventListener('DOMContentLoaded', loadTasks);
document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
        const observer = new MutationObserver(() => {
            updateNoTasksMessage(column);
        });

        // Start observing the column for changes in its children
        observer.observe(column.querySelector('.content'), { childList: true });

        // Initial check to update the message on page load
        updateNoTasksMessage(column);
    });
});
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

    // Daten über die REST API in Firebase speichern
    fetch('https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tasksData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Tasks successfully saved to Firebase:', data);
    })
    .catch(error => {
        console.error('Error saving tasks to Firebase:', error);
    });
}


function loadTasks() {
    fetch('https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions.json')
    .then(response => response.json())
    .then(tasksData => {
        console.log('Loaded tasksData:', tasksData); // Debugging-Ausgabe
        if (tasksData) {
            Object.keys(tasksData).forEach(columnKey => {
                console.log('Processing columnKey:', columnKey); // Debugging-Ausgabe
                const columnIndex = columnKey.replace('column', '');
                const column = document.querySelectorAll('.kanban-column')[columnIndex];
                const taskIds = tasksData[columnKey];

                taskIds.forEach(taskId => {
                    console.log('Assigning taskId:', taskId, 'to column:', columnIndex); // Debugging-Ausgabe
                    const task = document.getElementById(taskId);
                    if (task) {
                        column.querySelector('.content').appendChild(task);
                    }
                });

                updateNoTasksMessage(column);
            });
        }
    })
    .catch(error => {
        console.error('Error loading tasks from Firebase:', error);
    });
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
    getButtonData();
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
    document.getElementById("task-edit-popup").style.display = "block";
}

function closeTaskEditPopup() {
    document.getElementById("task-edit-popup").style.display = "none";
}



