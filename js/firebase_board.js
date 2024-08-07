function init() {
    getInfo();
    loadBoard();
}

async function loadBoard() {
    const content = document.getElementById('content-todo');
    const tasks = await fetchTasks();

    if (!Array.isArray(tasks)) {
        console.error('Tasks is not an array:', tasks);
        return;
    }

    tasks.forEach(async (task, index) => {
        const userStoryText = await userStory(`tasks/task${index + 1}/category`);
        const titleText = await title(`tasks/task${index + 1}/title`);
        const descriptionText = await descriptionFB(`tasks/task${index + 1}/description`);
        const subtaskText = await subtaskFB(`tasks/task${index + 1}/subtask`);
        const assignedPeople = await assignedFB(`tasks/task${index + 1}/assigned`);
        const priorityText = await priorityFB(`tasks/task${index + 1}/priority`);

        // Split the subtasks into an array
        const subtasks = subtaskText.split(',');

        // Create the assigned people HTML with initials
        const assignedHtml = assignedPeople.map(person => {
            const initials = person.name.split(' ').map(name => name[0]).join('');
            return `
                <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
                    ${initials}
                </span>
            `;
        }).join('');

        // Determine the image based on priority
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

        content.innerHTML += `
        <div class="task" draggable="true" ondragstart="drag(event)" id="task${index + 1}" onclick="openPopup(${index + 1})">
            <div class="task-header user-story">${userStoryText}</div>
            <div class="task-content">
                <h3>${titleText}</h3>
                <p>${descriptionText}</p>
                <div class="task-progress">
                    <div class="progress-bar" id="progress-bar-${index + 1}" style="width: 0%;"></div>
                </div>
                <p id="subtask-count-${index + 1}">0/${subtasks.length} Subtasks</p>
                <div class="d-flex">
                    <div class="task-assignees">
                        ${assignedHtml}    
                    </div>
                    <div class="task-priority">
                        <img src="${priorityImage}" style="width: 30px; height: 30px;">
                    </div>
                </div>
            </div>
        </div>
        `;
    });
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

async function openPopup(taskId) {
    const popup = document.getElementById('popup-tasks');
    const userStoryText = await userStory(`tasks/task${taskId}/category`);
    const titleText = await title(`tasks/task${taskId}/title`);
    const descriptionText = await descriptionFB(`tasks/task${taskId}/description`);
    const subtaskText = await subtaskFB(`tasks/task${taskId}/subtask`);
    const priorityText = await priorityFB(`tasks/task${taskId}/priority`);
    const assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`);
    const assignedHtml = assignedPeople.map(person => {
        const initials = person.name.split(' ').map(name => name[0]).join('');
        return `
        <div>
            <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; line-height: 30px; text-align: center; color: #fff;">
                ${initials}
            </span>
            <p>${person.name}<p>
        </div>
        `;
    }).join('');
    
    const subtasks = subtaskText.split(',');
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
    popup.innerHTML = `
    <div class="popup-content-task" id="popup-task${taskId}">
        <span class="close-button" onclick="closePopup()">&times;</span>
        <div class="user-story-popup">
            <div class="task-header-pop-up user-story">${userStoryText}</div>
            <h2 class="h1-popup">${titleText}</h2>
            <p>${descriptionText}</p>
            <p>Due date: 10/05/2023</p>
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
                <div class="popup-bottom-delete">
                    <img class="" src="/assets/img/delete_normal.png" onclick="deleteTask()">
                </div>
                <div class="divider-popup"></div>
                <div class="popup-bottom-edit">
                    <img src="/assets/img/edit_normal.png">
                </div>
            </div>
        </div>
    </div>
    `;
}

function closePopup() {
    document.getElementById('popup-tasks').style.display = 'none';
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
