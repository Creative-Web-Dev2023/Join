document.addEventListener('DOMContentLoaded', init12);

function init12() {
    getInfo(); // Load any necessary initial configurations
    loadBoard(); // Load tasks and initially render them
}

function createTaskElement(task, index) {
    const userStoryText = task.userStory || 'User Story';
    const titleText = task.title || 'Title';
    const descriptionText = task.description || 'Description';
    const subtasks = task.subtask ? task.subtask.split(',') : [];
    const subtaskCount = subtasks.length;
    const assignedPeople = task.assigned || [];
    const priorityText = task.priority || 'low';

    const assignedHtml = assignedPeople.map(person => {
        const initials = person.name.split(' ').map(name => name[0]).join('');
        return `
            <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
                ${initials}
            </span>
        `;
    }).join('');

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

    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.draggable = true;
    taskElement.id = `task${index + 1}`;

    taskElement.innerHTML = `
        <div class="task-header user-story">${userStoryText}</div>
        <div class="task-content">
            <h3>${titleText}</h3>
            <p>${descriptionText}</p>
            <div class="task-progress">
                <div class="progress-bar" id="progress-bar-${index + 1}" style="width: 0%;"></div>
            </div>
            <p id="subtask-count-${index + 1}">0/${subtaskCount} Subtasks</p>
            <div class="d-flex">
                <div class="task-assignees">
                    ${assignedHtml}    
                </div>
                <div class="task-priority">
                    <img src="${priorityImage}" style="width: 30px; height: 30px;">
                </div>
            </div>
        </div>
    `;

    taskElement.addEventListener('click', () => openPopup(index + 1));
    taskElement.addEventListener('dragstart', drag);

    return taskElement;
}




async function loadBoard() {
    const contentTodo = document.getElementById('content-todo');
    contentTodo.innerHTML = ''; // Clear existing tasks to avoid duplication

    const tasks = await fetchTasks();

    if (!Array.isArray(tasks)) {
        console.error('Tasks is not an array:', tasks);
        return;
    }

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        contentTodo.appendChild(taskElement);
    });

    loadTasks(); // Call this to restore the positions
}


// Function to update progress based on checked subtasks
function updateProgress(taskId, checkboxStatus) {
    const checkboxes = document.querySelectorAll(`#popup-task${taskId} input[type="checkbox"]`);
    const completedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const totalSubtasks = checkboxes.length;

    // Update progress bar
    const progressBar = document.getElementById(`progress-bar-${taskId}`);
    const progressPercentage = (completedCount / totalSubtasks) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Update completed subtask count
    const subtaskCountElement = document.getElementById(`subtask-count-${taskId}`);
    subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
}

async function fetchTasks() {
    try {
        let response = await fetch(BASE_URL + 'tasks.json');
        let data = await response.json();
        console.log('Tasks data:', data);

        // Check if data is an object and contains the tasks
        // Adjust this line based on the actual structure of your data
        let tasks = Object.values(data);

        return tasks; // Ensure that tasks is an array
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

let currentTaskData = {};
async function openPopup(taskId) {
    const popup = document.getElementById('popup-tasks');
    const userStoryText = await userStory(`tasks/task${taskId}/category`);
    const titleText = await title(`tasks/task${taskId}/title`);
    const dueDate = await dateFB(`tasks/task${taskId}/date`);
    const descriptionText = await descriptionFB(`tasks/task${taskId}/description`);
    const subtaskText = await subtaskFB(`tasks/task${taskId}/subtask`);
    const priorityText = await priorityFB(`tasks/task${taskId}/priority`);
    let assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`);

    updateProgress(taskId);
    // Handle the case where assignedPeople is undefined or empty
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
            <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
                ${initials}
            </span>
            <p>${person.name}<p>
        </div>
        `;
    }).join('') : '<p>No one assigned</p>';
    
    const subtasks = Array.isArray(subtaskText) ? subtaskText : subtaskText.split(',');
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

    const subtasksHtml = subtasks.map((subtask, index) => `
        <div class="subtask">
            <input type="checkbox" id="popup-subtask-${index}" name="subtask-${index}" onchange="updateProgress(${taskId})">
            <label for="popup-subtask-${index}">${subtask.trim()}</label>
        </div>
    `).join('');

    popup.style.display = 'flex';
    popup.innerHTML =  `
    <div class="popup-content-task" id="popup-task${taskId}">
        <span class="close-button" onclick="closePopup()">&times;</span>
        <div class="user-story-popup">
            <div class="task-header-pop-up user-story">${userStoryText}</div>
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
}


async function openEdit(taskId) {
    const userStoryText = await userStory(`tasks/task${taskId}/category`);
    const titleText = await title(`tasks/task${taskId}/title`);
    const dueDate = await dateFB(`tasks/task${taskId}/date`);
    const descriptionText = await descriptionFB(`tasks/task${taskId}/description`);
    const subtaskText = await subtaskFB(`tasks/task${taskId}/subtask`);
    const priorityText = await priorityFB(`tasks/task${taskId}/priority`);
    let assignedPeople = getSelectedContacts();

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
                    <div class="dropdown-toggle dropdown-start" onclick="toggleDropdown()">
                        <span class="dropdown-start">Select contacts to assign</span>
                        <span class="dropdown-start">▼</span>
                    </div>
                    <div class="dropdown-content" id="dropdown-content" style="width: 65%">
                    </div>
                </div>
                <div id="selected-contacts-container" class="selected-contacts">${assignedPeople}</div>
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

    // Populate the subtask list using the correct variable subtaskText
    if (typeof subtaskText === 'string') {
        const subtasks = subtaskText.split(',');
        
        const subtaskList = document.getElementById('subtask-list');
        subtaskList.innerHTML = subtasks.map((subtask, index) => `
            <li>
                <input type="checkbox" id="subtask-${index}" ${subtask.trim() ? 'checked' : ''}>
                <label for="subtask-${index}">${subtask.trim()}</label>
            </li>
        `).join('');
    } else {
        console.error('subtaskText is not a string:', subtaskText);
    }

    // Fetch and display contacts in the dropdown
    await getInfo(); // This will populate the dropdown with contacts
}


function putOnFb(taskId) {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('description-input').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const priority = document.querySelector('.prio-button.clicked')?.alt || 'low';
    const subtasks = Array.from(document.querySelectorAll('#subtask-list li')).map(li => li.textContent.trim());

    const updatedTask = {
        title,
        description,
        date,
        category,
        priority,
        subtask: subtasks.join(','),
        assigned: getSelectedContacts()
    };

    putData(`tasks/task${taskId}`, updatedTask)
        .then(() => {
            loadBoard(); // Board nach dem Speichern neu laden
            closePopup();
        })
        .catch(error => {
            console.error('Error updating task:', error);
            alert('Error updating task. Please try again later.');
        });
}


async function dateFB(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        let dueDate = await response.json();
        console.log(dueDate);
        return dueDate; // Assuming duedate is a string
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
        return subtask; // Assuming subtask is a string
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
        return assigned; // Assuming assigned is an array of objects with 'name' and 'color'
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
        return priority; // Assuming priority is a string like 'Urgent', 'Medium', or 'Low'
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
        // Call deleteData function to delete the task from Firebase
        await deleteData(`tasks/task${taskId}`);

        // Remove task from the DOM
        const taskElement = document.getElementById(`task${taskId}`);
        if (taskElement) {
            taskElement.remove();
        }

        // Update local storage
        saveTasks();

        // Close the popup after deletion
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
        // Hide the popup
        popup.style.display = 'none';
        
        // Optionally clear the popup content if needed
        popup.innerHTML = '';
    }

    if (overlay) {
        // Hide the overlay if used
        overlay.style.display = 'none';
    }
    
    // Reset any global state or variables if needed
    currentTaskData = {}; // Reset any task-specific data
}
