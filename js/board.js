function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let task = document.getElementById(data);
    let targetColumn = event.target.closest('.kanban-column');

    if (event.target.classList.contains('kanban-column')) {
        targetColumn = event.target;
    } else {
        targetColumn = event.target.closest('.kanban-column');
    }

    if (targetColumn) {
        targetColumn.appendChild(task);
        updateNoTasksMessage(targetColumn);
    }

    let sourceColumn = document.getElementById(task.id).closest('.kanban-column');
    updateNoTasksMessage(sourceColumn);
}

function updateNoTasksMessage(column) {
    let tasks = column.querySelectorAll('.task');
    let noTasksMessage = column.querySelector('.no-tasks');
    if (tasks.length === 0 && !noTasksMessage) {
        let noTasksDiv = document.createElement('div');
        noTasksDiv.classList.add('no-tasks');
        noTasksDiv.textContent = 'No tasks To do';
        column.appendChild(noTasksDiv);
    } else if (tasks.length > 0 && noTasksMessage) {
        noTasksMessage.remove();
    }
}