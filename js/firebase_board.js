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
        progressBarHtml = HtmlProgressBar(index, subtaskCount);
    }

    taskElement.innerHTML = HtmlTaskElement(headerBackgroundColor, userStoryText, titleText, descriptionText, progressBarHtml, assignedHtml, priorityImage);

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
    // Get all subtask images for the current task
    const subtaskImages = document.querySelectorAll(`#popup-task${taskId} .subtask img`);
    const totalSubtasks = subtaskImages.length;
    const completedCount = Array.from(subtaskImages).filter(img => img.src.includes('checkesbox.png')).length;

    // Update the progress bar
    const progressBar = document.getElementById(`progress-bar-${taskId}`);
    if (progressBar) {
        const progressPercentage = (completedCount / totalSubtasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    // Update the subtask count display
    const subtaskCountElement = document.getElementById(`subtask-count-${taskId}`);
    if (subtaskCountElement) {
        subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
    }

    // Save the subtask progress to localStorage
    saveSubtaskProgress(taskId, subtaskImages);
}

function saveSubtaskProgress(taskId) {
    const subtaskImages = document.querySelectorAll(`#popup-task${taskId} .subtask img`);
    const subtaskStatuses = Array.from(subtaskImages).map(img => img.src.includes('checkesbox.png'));
    
    // Save the subtask states to localStorage
    localStorage.setItem(`task-${taskId}-subtasks`, JSON.stringify(subtaskStatuses));
}



function loadSubtaskProgress(taskId) {
    const savedStatuses = JSON.parse(localStorage.getItem(`task-${taskId}-subtasks`)) || [];
    const subtaskImages = document.querySelectorAll(`#popup-task${taskId} .subtask img`);

    if (subtaskImages.length > 0) {
        subtaskImages.forEach((img, index) => {
            img.src = savedStatuses[index] ? '/assets/img/img_add_task/checkesbox.png' : '/assets/img/img_add_task/checkbox.png';
        });
        updateProgress(taskId);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const subtaskImages = document.querySelectorAll(`#popup-task${taskId} .subtask img`);
            if (subtaskImages.length > 0) {
                subtaskImages.forEach((img, index) => {
                    img.src = savedStatuses[index] ? '/assets/img/img_add_task/checkesbox.png' : '/assets/img/img_add_task/checkbox.png';
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
    <div class="subtask flex" onclick="toggleCheckbox(${index}, ${taskId})">
        <img src="/assets/img/img_add_task/checkbox.png" id="popup-subtask-${index}" name="subtask-${index}" style="height: 16px">
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
    popup.innerHTML = HtmlPopup(taskId, headerBackgroundColor, userStoryText, titleText, descriptionText, dueDate, priorityText, priorityImage, assignedHtml, subtasksHtml);

    loadSubtaskProgress(taskId);
}

function toggleCheckbox(index, taskId) {
    const imgElement = document.getElementById(`popup-subtask-${index}`);
    const isChecked = imgElement.src.includes('checkbox.png');
    
    imgElement.src = isChecked ? '/assets/img/img_add_task/checkesbox.png' : '/assets/img/img_add_task/checkbox.png';

    updateProgress(taskId);
    saveSubtaskProgress(taskId);
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
    selctedAssignees(taskId);

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
    edit.innerHTML = HtmlEdit(titleText, descriptionText, taskId, assignedHtml, dueDate, priorityText, userStoryText);

    // Load existing subtasks into the edit form
    if (typeof subtaskText === 'string') {
        const subtasks = subtaskText.split(',').filter(subtask => subtask.trim() !== '');

        const subtaskList = document.getElementById('subtask-list');
        subtaskList.innerHTML = subtasks.map((subtask, index) => `
            <div id="subtask-${index}" style="display: flex; align-items: center;">
                <p class="subtask" contenteditable="true" style="flex-grow: 1;">${subtask.trim()}</p>
                <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtasks(${index})">
            </div>
        `).join('');

        // Add event listeners to each subtask for immediate local storage update
        subtasks.forEach((subtask, index) => {
            const subtaskElement = document.querySelector(`#subtask-${index} .subtask`);
            subtaskElement.addEventListener('input', () => updateSubtaskInLocalStorage(taskId, index, subtaskElement.textContent));
        });
    } else {
        console.error('subtaskText is not a string:', subtaskText);
    }
}
function updateSubtasksInFirebase(taskId) {
    const newSubtasks = Array.from(document.querySelectorAll('#subtask-list .subtask')).map(p => p.textContent.trim());

    const combinedSubtasks = newSubtasks.filter(subtask => subtask.trim() !== '');

    putData(`tasks/task${taskId}/subtask`, combinedSubtasks.join(','))
        .then(() => {
            console.log('Subtasks updated in Firebase.');
        })
        .catch(error => {
            console.error('Error updating subtasks in Firebase:', error);
        });
}

function addSubtasks(taskId) {
    const input = document.getElementById('subtask-input');
    const subtaskText = input.value.trim();

    if (subtaskText === '') return; // Prevent empty subtasks

    const subtaskList = document.getElementById('subtask-list');
    const index = subtaskList.children.length;

    // Create a new subtask element
    const subtaskItem = document.createElement('div');
    subtaskItem.id = `subtask-${index}`;
    subtaskItem.style.display = 'flex';
    subtaskItem.style.alignItems = 'center';
    subtaskItem.innerHTML = `
        <p class="subtask" contenteditable="true" style="flex-grow: 1;">${subtaskText}</p>
        <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtasks(${index})">
    `;

    // Add event listener for immediate updates
    const subtaskElement = subtaskItem.querySelector('.subtask');
    subtaskElement.addEventListener('input', () => updateSubtaskInLocalStorage(taskId, index, subtaskElement.textContent));

    // Append the new subtask to the list
    subtaskList.appendChild(subtaskItem);

    // Clear the input field after adding the subtask
    input.value = '';

    // Update the subtask in Firebase immediately
    updateSubtasksInFirebase(taskId);
}
function updateSubtaskInLocalStorage(taskId, subtaskIndex, newText) {
    const savedStatuses = JSON.parse(localStorage.getItem(`task-${taskId}-subtasks`)) || [];

    // Ensure the savedStatuses array is the correct length
    while (savedStatuses.length <= subtaskIndex) {
        savedStatuses.push(false); // Assuming false means not completed
    }

    // Update the corresponding subtask text in local storage
    const existingSubtasks = JSON.parse(localStorage.getItem(`task-${taskId}-subtask-texts`)) || [];
    existingSubtasks[subtaskIndex] = newText.trim();
    localStorage.setItem(`task-${taskId}-subtask-texts`, JSON.stringify(existingSubtasks));

    console.log(`Subtask ${subtaskIndex} updated to: ${newText}`);

    // Update Firebase as well
    updateSubtasksInFirebase(taskId);
}

function removeSubtasks(index) {
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

    // Collect all current subtasks from the list
    const newSubtasks = Array.from(document.querySelectorAll('#subtask-list .subtask')).map(p => p.textContent.trim());

    subtaskFB(`tasks/task${taskId}/subtask`).then(existingSubtasks => {
        const existingSubtaskArray = Array.isArray(existingSubtasks) ? existingSubtasks : existingSubtasks.split(',').filter(subtask => subtask.trim() !== '');

        // Combine existing subtasks with newly added subtasks, ensuring no duplicates
        const combinedSubtasks = [...existingSubtaskArray, ...newSubtasks].filter((subtask, index, self) => self.indexOf(subtask) === index);

        const updatedTask = {
            title,
            description,
            date,
            category,
            priority,
            subtask: combinedSubtasks.join(','),  // Join subtasks into a single string
            assigned: getSelectedContacts()
        };

        // Save the updated task to Firebase
        putData(`tasks/task${taskId}`, updatedTask)
            .then(() => {
                window.location.href = '/html/board.html'; // Redirect or refresh the board
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
