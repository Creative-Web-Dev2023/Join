

function init12() {
    getInfo();
    loadBoard();
}



function createTaskElement(task, index) {
    const userStoryText = task.category;
    const titleText = task.title || 'Title';
    const descriptionText = task.description || 'Description';
    const subtasks = task.subtask ? task.subtask.split(',').filter(subtask => subtask.trim() !== '') : [];
    const subtaskCount = subtasks.length;
    const assignedPeople = task.assigned || [];
    const priorityText = task.priority || 'low';

    

    let priorityImage;
    switch (priorityText.toLowerCase()) {
        case 'urgent':
            priorityImage = '/assets/img/img_board/urgent.png';
            break;
        case 'medium':
            priorityImage = '/assets/img/img_board/medium.png';
            break;
        case 'low':
            priorityImage = '/assets/img/img_board/low.png';
            break;
        default:
            priorityImage = 'default.png';
    }
    const assignedHtml = generateAssignedHtml(assignedPeople);

    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.draggable = true;
    taskElement.id = `task${index + 1}`;

    // Determine the background color based on the user story type
    let headerBackgroundColor;
    if (userStoryText === 'Technical Task') {
        headerBackgroundColor = '#1FD7C1';
    } else if (userStoryText === 'User Story') {
        headerBackgroundColor = '#0038FF';
    } else {
        headerBackgroundColor = '#FFF'; // Default or other task types
    }

    let progressBarHtml = '';
    if (subtaskCount > 0) {
        progressBarHtml = `
            <div class="task-progress">
                <div class="progress-bar" id="progress-bar-${index + 1}" style="width: 0%;"></div>
            </div>
            <p id="subtask-count-${index + 1}">0/${subtaskCount} Subtasks</p>
        `;
    }

    taskElement.innerHTML = `
        <div class="task-header user-story" style="background: ${headerBackgroundColor};">${userStoryText}</div>
        <div class="task-content">
            <h3>${titleText}</h3>
            <p>${descriptionText}</p>
            ${progressBarHtml}
            <div class="d-flex">
                <div class="task-assignees">
                    ${assignedHtml}    
                </div>
                <div class="task-priority">
                    <img src="${priorityImage}" style="width: 30px; height: 20px;">
                </div>
            </div>
        </div>
    `;

    taskElement.addEventListener('click', () => openPopup(index + 1));
    taskElement.addEventListener('dragstart', drag);

    return taskElement;
}

function generateAssignedHtml(assignedPeople) {
    return assignedPeople.map(person => {
        const initials = person.name.split(' ').map(name => name[0]).join('');
        return `
            <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
                ${initials}
            </span>
        `;
    }).join('');
}

async function loadBoard() {
    const contentTodo = document.getElementById('content-todo');
    contentTodo.innerHTML = '';
    const tasks = await fetchTasks();

    if (!Array.isArray(tasks) || tasks.length === 0) {
        console.log('No tasks available.');
        contentTodo.innerHTML = '<p>No tasks available.</p>';
        return;
    }

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        contentTodo.appendChild(taskElement);

        loadSubtaskProgress(index + 1);

        updateProgressBarFromLocalStorage(index + 1);
    });

    loadTasks();
}

function updateProgressBarFromLocalStorage(taskId) {
    const savedStatuses = JSON.parse(localStorage.getItem(`task-${taskId}-subtasks`)) || [];
    const completedCount = savedStatuses.filter(status => status).length;
    const totalSubtasks = savedStatuses.length;

    const progressBar = document.getElementById(`progress-bar-${taskId}`);
    if (progressBar) {
        const progressPercentage = totalSubtasks > 0 ? (completedCount / totalSubtasks) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;
    }

    const subtaskCountElement = document.getElementById(`subtask-count-${taskId}`);
    if (subtaskCountElement) {
        subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
    }
}

function updateProgress(taskId) {
    const checkboxes = document.querySelectorAll(`#popup-task${taskId} input[type="checkbox"]`);
    const completedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const totalSubtasks = checkboxes.length;

    const progressBar = document.getElementById(`progress-bar-${taskId}`);
    if (progressBar) {
        const progressPercentage = (completedCount / totalSubtasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    const subtaskCountElement = document.getElementById(`subtask-count-${taskId}`);
    if (subtaskCountElement) {
        subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
    }

    saveSubtaskProgress(taskId, checkboxes);
}

function saveSubtaskProgress(taskId, checkboxes) {
    const subtaskStatuses = Array.from(checkboxes).map(checkbox => checkbox.checked);
    localStorage.setItem(`task-${taskId}-subtasks`, JSON.stringify(subtaskStatuses));
}

function loadSubtaskProgress(taskId) {
    const savedStatuses = JSON.parse(localStorage.getItem(`task-${taskId}-subtasks`)) || [];
    const checkboxes = document.querySelectorAll(`#popup-task${taskId} input[type="checkbox"]`);

    if (checkboxes.length > 0) {
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = savedStatuses[index] || false;
        });
        updateProgress(taskId);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const checkboxes = document.querySelectorAll(`#popup-task${taskId} input[type="checkbox"]`);
            if (checkboxes.length > 0) {
                checkboxes.forEach((checkbox, index) => {
                    checkbox.checked = savedStatuses[index] || false;
                });
                updateProgress(taskId);
            }
        });
    }
}

async function fetchTasks() {
    try {
        let response = await fetch(BASE_URL + 'tasks.json');
        let data = await response.json();
        console.log('Tasks data:', data);
        let tasks = Object.values(data);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

async function openPopup(taskId) {
    const popup = document.getElementById('popup-tasks');
    const userStoryText = await userStory(`tasks/task${taskId}/category`);
    const titleText = await title(`tasks/task${taskId}/title`);
    const dueDate = await dateFB(`tasks/task${taskId}/date`);
    const descriptionText = await descriptionFB(`tasks/task${taskId}/description`);
    const subtaskText = await subtaskFB(`tasks/task${taskId}/subtask`);
    const priorityText = await priorityFB(`tasks/task${taskId}/priority`);
    let assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`);

    assignedPeople = assignedPeople || [];

    currentTaskData = {
        taskId,
        userStoryText,
        titleText,
        dueDate,
        descriptionText,
        subtaskText,
        priorityText,
        assignedPeople
    };

    const assignedHtml = assignedPeople.length > 0 ? assignedPeople.map(person => {
        const initials = person.name.split(' ').map(name => name[0]).join('');
        return `
        <div>
            <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; text-align: center; color: #fff;">
                ${initials}
            </span>
            <p>${person.name}<p>
        </div>
        `;
    }).join('') : '<p>No one assigned</p>';

    const subtasks = Array.isArray(subtaskText) ? subtaskText : subtaskText.split(',').filter(subtask => subtask.trim() !== '');

    const subtasksHtml = subtasks.length > 0 ? subtasks.map((subtask, index) => `
        <div class="subtask">
            <input type="checkbox" id="popup-subtask-${index}" name="subtask-${index}" onchange="updateProgress(${taskId})">
            <label for="popup-subtask-${index}">${subtask.trim()}</label>
        </div>
    `).join('') : '<p>No subtasks available.</p>';

    let priorityImage;
    switch (priorityText.toLowerCase()) {
        case 'urgent':
            priorityImage = '/assets/img/img_board/urgent.png';
            break;
        case 'medium':
            priorityImage = '/assets/img/img_board/medium.png';
            break;
        case 'low':
            priorityImage = '/assets/img/img_board/low.png';
            break;
        default:
            priorityImage = 'default.png';
    }

    // Determine the background color based on the user story type
    let headerBackgroundColor;
    if (userStoryText === 'Technical Task') {
        headerBackgroundColor = '#1FD7C1';
    } else if (userStoryText === 'User Story') {
        headerBackgroundColor = '#0038FF';
    } else {
        headerBackgroundColor = '#FFF'; // Default or other task types
    }

    popup.style.display = 'flex';
    popup.innerHTML = `
    <div class="popup-content-task" id="popup-task${taskId}">
        <span class="close-button" onclick="closePopup()">&times;</span>
        <div class="user-story-popup">
            <div class="task-header-pop-up user-story" style="background: ${headerBackgroundColor};">${userStoryText}</div>
            <h2 class="h1-popup">${titleText}</h2>
            <p>${descriptionText}</p>
            <p>Due date: ${dueDate}</p>
            <p>Priority: ${priorityText} <img src="${priorityImage}" style="width: 15px; height: 15px;"></p>
            <p>Assigned To:</p>
            <div class="assigned-popup-split2">
            ${assignedHtml}
            </div>
            <p>${subtasks.length} Subtasks</p>
            <div class="task-subtasks">
                ${subtasksHtml}
            </div>
            <div class="trash-edit-popup-container">
                <div class="popup-bottom-delete" onclick="deleteTask(${taskId})">
                    <img class="" src="/assets/img/delete_normal.png">
                </div>
                <div class="divider-popup"></div>
                <div class="popup-bottom-edit" onclick="openEdit(${taskId}), getInfo()">
                    <img src="/assets/img/edit_normal.png">
                </div>
            </div>
        </div>
    </div>
    `;

    loadSubtaskProgress(taskId);
}
async function selctedAssignees(taskId) {
    let assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`); 

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.setAttribute('data-selected', 'false');
        const img = item.querySelector('.toggle-image');
        img.src = '/assets/img/img_add_task/checkbox.png';
        img.alt = 'Unselected';
        item.style.backgroundColor = '';
        item.style.color = '';
    });
    
    assignedPeople.forEach(person => {
        const dropdownItem = document.querySelector(`.dropdown-item[data-name="${person.name}"]`);
        if (dropdownItem) {
            dropdownItem.setAttribute('data-selected', 'true');
            const img = dropdownItem.querySelector('.toggle-image');
            img.src = '/assets/img/img_add_task/checkedbox.png';
            img.alt = 'Selected';
            dropdownItem.style.backgroundColor = '#2A3647';
            dropdownItem.style.color = 'white';
            console.log(dropdownItem);
        }
    });
}

async function openEdit(taskId) {
    const userStoryText = await userStory(`tasks/task${taskId}/category`);
    const titleText = await title(`tasks/task${taskId}/title`);
    const dueDate = await dateFB(`tasks/task${taskId}/date`);
    const descriptionText = await descriptionFB(`tasks/task${taskId}/description`);
    const subtaskText = await subtaskFB(`tasks/task${taskId}/subtask`);
    const priorityText = await priorityFB(`tasks/task${taskId}/priority`);
    let assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`); 

    if (!Array.isArray(assignedPeople)) {
        assignedPeople = [];
    }

    const assignedHtml = generateAssignedHtml(assignedPeople);




    document.getElementById(`popup-task${taskId}`).style.height = '80%';

    let edit = document.getElementById(`popup-task${taskId}`);
    edit.innerHTML = `
    <div>
    <form>
        <div class="first-container">
            <div class="first-container-formatted part-1">
                <label for="title">Title <span class="red">*</span></label>
                <input id="title-input" class="input-style-1" placeholder="Enter a title" type="text" value="${titleText}">
                <span class="close-button" onclick="closePopup()">&times;</span>
            </div>
            <div class="first-container-formatted part-2">
                <label for="description">Description</label>
                <textarea id="description-input" class="input-style-2" placeholder="Enter a Description"
                    type="text">${descriptionText}</textarea>
            </div>
            <div class="first-container-formatted part-3">
                <label for="assigned to">Assigned To</label>
                <div class="dropdown-format">
                    <div class="dropdown-toggle dropdown-start" onclick="toggleDropdown(${taskId})">
                        <span class="dropdown-start">Select contacts to assign</span>
                        <span class="dropdown-start">▼</span>
                    </div>
                    <div class="dropdown-content" id="dropdown-content" style="width: 65%">
                    </div>
                </div>
                <div id="selected-contacts-container" class="selected-contacts">${assignedHtml}</div>
            </div>
            <div class="first-container-formatted part-1">
                <label for="due-date">Due date <span class="red">*</span></label>
                <input id="date" class="input-style-1" placeholder="dd/mm/yyyy" type="date" value="${dueDate}">
            </div>
            <div>
                <label for="prio">Prio</label>
                <div class="prio-buttons">
                    <img class="prio-button" id="urgent" src="/assets/img/img_add_task/urgent_standart.png" alt="Urgent" ${priorityText === 'Urgent' ? 'class="clicked"' : ''}>
                    <img class="prio-button" id="medium" src="/assets/img/img_add_task/medium_standart.png" alt="Medium" ${priorityText === 'Medium' ? 'class="clicked"' : ''}>
                    <img class="prio-button" id="low" src="/assets/img/img_add_task/low_standart.png" alt="Low" ${priorityText === 'Low' ? 'class="clicked"' : ''}>
                </div>
            </div>
            <div class="first-container-formatted part-2">
                <label for="category">Category <span class="red">*</span></label>
                <select id="category" name="Selects contacts to assign">
                    <option value="" disabled>Select Task Category</option>
                    <option value="Technical Task" ${userStoryText === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                    <option value="User Story" ${userStoryText === 'User Story' ? 'selected' : ''}>User Story</option>
                </select>
            </div>
            <div class="first-container-formatted part-3 space subtask-container">
                <label for="subtask">Subtasks</label>
                <div class="input-wrapper">
                    <input class="input-style-1 img-for-subtask" placeholder="Add new subtask" type="text" id="subtask-input">
                    <div id="add-subtask-btn" onclick="addSubtask()"></div>
                </div>
                <ul id="subtask-list" class="subtask-list"></ul>
            </div>
            <button type="button" onclick="putOnFb(${taskId}), error()">Save</button>
        </div>
    </form>
    </div>
    `;

    if (typeof subtaskText === 'string') {
        const subtasks = subtaskText.split(',').filter(subtask => subtask.trim() !== '');

        const subtaskList = document.getElementById('subtask-list');
        subtaskList.innerHTML = subtasks.map((subtask, index) => `
            <div id="subtask-${index}" style="display: flex; align-items: center;">
                <p class="subtask" style="flex-grow: 1;">${subtask.trim()}</p>
                <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtask(${index})">
            </div>
        `).join('');
    } else {
        console.error('subtaskText is not a string:', subtaskText);
    }
}

function removeSubtask(index) {
    const subtaskElement = document.getElementById(`subtask-${index}`);
    const subtaskText = subtaskElement.querySelector('.subtask').textContent;

    if (subtaskElement) {
        subtaskElement.remove();
        deleteSubTaskFB(`tasks/task${currentTaskData.taskId}`, subtaskText);
    }
}


async function deleteSubTaskFB(path, subtaskToDelete) {
    console.log("Path:", path);

    let taskResponse = await fetch(BASE_URL + path + ".json");
    let taskData = await taskResponse.json();

    if (!taskData || !taskData.subtask) {
        console.log("No subtasks found or invalid path.");
        return;
    }

    let subtasks = taskData.subtask.split(',');

    let updatedSubtasks = subtasks.filter(subtask => subtask.trim() !== subtaskToDelete.trim());

    if (updatedSubtasks.length === subtasks.length) {
        console.log("Subtask not found.");
        return;
    }

    let updatedSubtaskString = updatedSubtasks.join(',');

    let updateResponse = await fetch(BASE_URL + path + ".json", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ subtask: updatedSubtaskString })
    });

    return await updateResponse.json();
}



function putOnFb(taskId) {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('description-input').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const priority = document.querySelector('.prio-button.clicked')?.alt || 'low';

    if (!title || !date || !category) {
        return; // Exit the function if validation fails
    }

    subtaskFB(`tasks/task${taskId}/subtask`).then(existingSubtasks => {
        const existingSubtaskArray = Array.isArray(existingSubtasks) ? existingSubtasks : existingSubtasks.split(',').filter(subtask => subtask.trim() !== '');

        const newSubtasks = Array.from(document.querySelectorAll('#subtask-list li')).map(li => li.textContent.trim());

        const combinedSubtasks = [...existingSubtaskArray, ...newSubtasks].filter((subtask, index, self) => self.indexOf(subtask) === index); // Remove duplicates

        const updatedTask = {
            title,
            description,
            date,
            category,
            priority,
            subtask: combinedSubtasks.join(','),
            assigned: getSelectedContacts()
        };

        putData(`tasks/task${taskId}`, updatedTask)
            .then(() => {
                window.location.href = '/html/board.html';
            })
            .catch(error => {
                console.error('Error updating task:', error);
                alert('Error updating task. Please try again later.');
            });
    }).catch(error => {
        console.error('Error fetching existing subtasks:', error);
    });
}



async function dateFB(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let dueDate = await response.json();
        console.log(dueDate);
        return dueDate;
    } catch (error) {
        console.error('Error fetching duedate:', error);
        return 'Error loading duedate';
    }
}

async function subtaskFB(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let subtask = await response.json();
        console.log(subtask);
        return subtask;
    } catch (error) {
        console.error('Error fetching subtask:', error);
        return 'Error loading subtask';
    }
}

async function descriptionFB(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let description = await response.json();
        console.log(description);
        return description;
    } catch (error) {
        console.error('Error fetching description:', error);
        return 'Error loading description';
    }
}

async function title(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let title = await response.json();
        console.log(title);
        return title;
    } catch (error) {
        console.error('Error fetching title:', error);
        return 'Error loading title';
    }
}

async function userStory(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let userStory = await response.json();
        console.log(userStory);
        return userStory;
    } catch (error) {
        console.error('Error fetching user story:', error);
        return 'Error loading user story';
    }
}

async function assignedFB(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let assigned = await response.json();
        console.log(assigned);
        return assigned;
    } catch (error) {
        console.error('Error fetching assigned people:', error);
        return [];
    }
}

async function priorityFB(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let priority = await response.json();
        console.log(priority);
        return priority;
    } catch (error) {
        console.error('Error fetching priority:', error);
        return 'Error loading priority';
    }
}

function move() {
    if (i == 0) {
        i = 1;
        var elem = document.getElementById("myBar");
        var width = 10;
        var id = setInterval(frame, 10);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
            } else {
                width++;
                elem.style.width = width + "%";
                elem.innerHTML = width + "%";
            }
        }
    }
}
async function deleteTask(taskId) {
    try {
        await deleteData(`tasks/task${taskId}`);
        const taskElement = document.getElementById(`task${taskId}`);
        if (taskElement) {
            taskElement.remove();
        }
        saveTasks();
        closePopup();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function deleteData(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error deleting data:', error);
        return null;
    }
}

function closePopup() {
    const popup = document.getElementById('popup-tasks');
    const overlay = document.getElementById('overlay-task');

    if (popup) {
        popup.style.display = 'none';
        popup.innerHTML = '';
    }

    if (overlay) {
        overlay.style.display = 'none';
    }

    currentTaskData = {};
}
