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

    let targetColumn;
    if (event.target.classList.contains('kanban-column')) {
        targetColumn = event.target;
    } else {
        targetColumn = event.target.closest('.kanban-column');
    }

    const sourceColumn = task.closest('.kanban-column');

    if (targetColumn) {
        targetColumn.appendChild(task);
        updateNoTasksMessage(targetColumn);
        updateNoTasksMessage(sourceColumn);
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

document.addEventListener("DOMContentLoaded", function() {
    const closeButton = document.getElementById("closeButton");
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");

    document.querySelector(".add-task-button").addEventListener("click", showPopup);
    closeButton.addEventListener("click", hidePopup);
    overlay.addEventListener("click", hidePopup);

    function showPopup() {
        overlay.style.display = "block";
        popup.classList.add("show");
    }

    function hidePopup() {
        popup.classList.remove("show");
        setTimeout(function() {
            overlay.style.display = "none";
        }, 500);
    }
});

function openPopup() {
    document.getElementById('popup-tasks').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup-tasks').style.display = 'none';
}


