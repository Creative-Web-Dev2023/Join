function init12() {
    getInfo();
    loadBoard();
}

function createTaskElement(task, index) {
    const { category, title, description, subtask, assigned, priority } = task;
    const userStoryText = category;
    const titleText = title || 'Title';
    const descriptionText = description || 'Description';
    const subtasks = subtask ? subtask.split(',').filter(st => st.trim() !== '') : [];
    const subtaskCount = subtasks.length;
    const priorityImage = getPriorityImage(priority);

    const taskElement = createTaskDiv(index);
    taskElement.innerHTML = HtmlTaskElement(
        getHeaderColor(userStoryText),
        userStoryText, titleText, descriptionText,
        subtaskCount ? HtmlProgressBar(index, subtaskCount) : '',
        generateAssignedHtml(assigned || []),
        priorityImage
    );

    addTaskListeners(taskElement, index);
    return taskElement;
}

document.querySelectorAll('.prio-button').forEach(function (button) {
    button.addEventListener('mouseover', handleMouseOver);
    button.addEventListener('mouseout', handleMouseOut);
    button.addEventListener('click', handleClick);
});

function handleMouseOver() {
    if (!this.classList.contains('clicked')) {
        const hoverSrc = this.src.replace('_standart', '_hover');
        this.src = hoverSrc;
    }
}

function handleMouseOut() {
    if (!this.classList.contains('clicked')) {
        const standartSrc = this.src.replace('_hover', '_standart');
        this.src = standartSrc;
    }
}

function handleClick() {
    document.querySelectorAll('.prio-button').forEach(function (btn) {
        if (btn !== this) {
            btn.classList.remove('clicked');
            if (btn.src.includes('_clicked')) {
                btn.src = btn.src.replace('_clicked', '_standart');
            }
        }
    }, this);

    this.classList.add('clicked');
    if (this.src.includes('_hover') || this.src.includes('_standart')) {
        this.src = this.src.replace(/_hover|_standart/, '_clicked');
    }
}


function getPriorityImage(priority) {
    const priorities = {
        'urgent': '/assets/img/img_board/urgent.png',
        'medium': '/assets/img/img_board/medium.png',
        'low': '/assets/img/img_board/low.png'
    };
    return priorities[priority?.toLowerCase()] || '/assets/img/img_board/default.png';
}

function createTaskDiv(index) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.draggable = true;
    taskDiv.id = `task${index + 1}`;
    return taskDiv;
}

function getHeaderColor(userStoryText) {
    const colors = {
        'Technical Task': '#1FD7C1',
        'User Story': '#0038FF'
    };
    return colors[userStoryText] || '#FFF';
}

function addTaskListeners(taskElement, index) {
    taskElement.addEventListener('click', () => openPopup(index + 1));
    taskElement.addEventListener('dragstart', drag);
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
    const tasks = await fetchTasks();

    if (!tasks || tasks.length === 0) {
        console.log('No tasks available.');
        return;
    }

    const tasksPositions = await fetchTasksPositions();

    const columnMapping = {
        "0": "content-todo",
        "1": "content-inprogress",
        "2": "content-awaitfeedback",
        "3": "content-done"
    };

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        const columnId = findColumnForTask(task.id, tasksPositions);

        // Append the task to the correct column based on task positions
        const columnContentId = columnMapping[columnId];
        if (columnContentId) {
            const columnContent = document.getElementById(columnContentId);
            if (columnContent) {
                columnContent.appendChild(taskElement);
            } else {
                console.error(`Content element not found for column ID: ${columnContentId}`);
            }
        } else {
            console.error(`No mapping found for column ID: ${columnId}`);
        }

        // Update the progress bar and the checkbox UI after loading each task
        updateProgress(task.id);
    });

    // Call the existing saveTasks function to update Firebase with task positions
    saveTasks();
}





async function fetchTasksPositions() {
    const response = await fetch('https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions/.json');
    return await response.json();
}

function findColumnForTask(taskId, tasksPositions) {
    // Überprüfen, ob tasksPositions vorhanden und gültig ist
    if (!tasksPositions || Object.keys(tasksPositions).length === 0) {
        console.error(`No task positions found, defaulting task ${taskId} to column 0`);
        return "0"; // Fallback auf Spalte 0 (To Do), wenn keine Positionen vorhanden sind
    }

    // Rest des Codes bleibt gleich
    for (const [columnKey, taskIds] of Object.entries(tasksPositions)) {
        if (taskIds.includes(taskId)) {
            return columnKey.replace('column', ''); // Gibt die entsprechende Spaltennummer zurück
        }
    }

    console.error(`Task ID: ${taskId} not found in any column, defaulting to column 0`);
    return "0"; // Fallback auf Spalte 0 (To Do)
}

async function saveCheckboxState(taskId, subtaskIndex, isChecked) {
    const firebasePath = `tasks/task${taskId}/subtaskStatuses/${subtaskIndex}`;

    try {
        const response = await fetch(BASE_URL + firebasePath + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(isChecked) // Speichere den Zustand: true oder false
        });

        if (!response.ok) {
            throw new Error('Fehler beim Speichern des Zustands in Firebase');
        }

        console.log(`Subtask ${subtaskIndex} status für Task ${taskId} wurde erfolgreich als ${isChecked} in Firebase gespeichert.`);
    } catch (error) {
        console.error('Fehler beim Speichern des Checkbox-Zustands in Firebase:', error);
        throw error; // Fehler weiterwerfen, damit die obere Funktion den Fehler ebenfalls behandeln kann
    }
}


async function processTaskWithSubtasks(task, index) {
    const taskElement = createTaskElement(task, index);

    // Lade die Subtasks für diesen Task
    const subtaskText = await subtaskFB(`tasks/task${task.id}/subtask`);
    if (subtaskText) {
        const subtasksContainer = document.createElement('div');
        taskElement.appendChild(subtasksContainer);

        // Aktualisiere die Progress Bar und den Subtask-Zähler direkt nach dem Laden der Subtasks
        await updateProgressBarFromFirebase(task.id); // Nutze die richtige Task-ID
    }

    return taskElement;
}

async function updateProgressBarFromFirebase(taskId) {
    console.log(`Updating progress bar for task ID: ${taskId}`);

    const savedStatuses = await getSavedStatusesFromFirebase(taskId);
    console.log('Saved statuses:', savedStatuses);

    const totalSubtasks = savedStatuses.length;
    const completedCount = savedStatuses.filter(status => status === true).length;

    console.log(`Total subtasks: ${totalSubtasks}, Completed: ${completedCount}`);

    updateProgressBarUI(taskId, completedCount, totalSubtasks);
    updateSubtaskCountElement(taskId, completedCount, totalSubtasks);
}



function showNoTasksMessage(container) {
    console.log('No tasks available.');
    container.innerHTML = '<p>No tasks available.</p>';
}

function processTask(task, index, container) {
    const taskElement = createTaskElement(task, index);
    container.appendChild(taskElement);
    loadSubtaskProgress(index + 1);
    updateProgressBarFromFirebase(index + 1);
}

document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.kanban-column .content');

    columns.forEach(column => {
        const observer = new MutationObserver(() => {
            const tasks = column.querySelectorAll('.task');
            tasks.forEach(task => {
                const taskId = task.id.replace('task', ''); // Extrahiere die Task-ID
                updateProgressBarFromFirebase(taskId); // Aktualisiere die Progress Bar
            });
        });

        // Überwache Änderungen in der Struktur der Kinder
        observer.observe(column, { childList: true });

        // Initiale Aktualisierung der Progress Bars
        const tasks = column.querySelectorAll('.task');
        tasks.forEach(task => {
            const taskId = task.id.replace('task', ''); // Extrahiere die Task-ID
            updateProgressBarFromFirebase(taskId); // Aktualisiere die Progress Bar
        });
    });
});



function calculateSubtaskCounts(statuses) {
    const completedCount = statuses.filter(status => status).length;
    return { completedCount, totalSubtasks: statuses.length };
}



function updateSubtaskCountElement(taskId, completedCount, totalSubtasks) {
    const subtaskCountElement = document.getElementById(`subtask-count-${taskId}`);
    if (subtaskCountElement) {
        subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
    }
}


function updateProgress(taskId) {
    const subtaskImages = getSubtaskImages(taskId);
    const { completedCount, totalSubtasks } = calculateSubtaskCompletion(subtaskImages);

    updateProgressBarUI(taskId, completedCount, totalSubtasks);
    updateSubtaskCountUI(taskId, completedCount, totalSubtasks);

    saveSubtaskProgress(taskId, subtaskImages);
}

function getSubtaskImages(taskId) {
    return document.querySelectorAll(`#popup-task${taskId} .subtask img`);
}

function calculateSubtaskCompletion(subtaskImages) {
    const completedCount = Array.from(subtaskImages).filter(img => img.src.includes('checkesbox.png')).length;
    return { completedCount, totalSubtasks: subtaskImages.length };
}

function updateProgressBarUI(taskId, completedCount, totalSubtasks) {
    const progressBar = document.getElementById(`progress-bar-${taskId}`);
    if (progressBar) {
        const progressPercentage = (completedCount / totalSubtasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }
}

function updateSubtaskCountUI(taskId, completedCount, totalSubtasks) {
    const subtaskCountElement = document.getElementById(`subtask-count-${taskId}`);
    if (subtaskCountElement) {
        subtaskCountElement.textContent = `${completedCount}/${totalSubtasks} Subtasks`;
    }
}

async function saveSubtaskProgress(taskId) {
    const subtaskImages = document.querySelectorAll(`#popup-task${taskId} .subtask img`);
    const subtaskStatuses = Array.from(subtaskImages).map(img => img.src.includes('checkesbox.png'));

    // Erstelle den Pfad zu Firebase für die Subtask-Statuse
    const firebasePath = `tasks/task${taskId}/subtaskStatuses`;

    // Speichere die Subtask-Statuse in Firebase
    try {
        await fetch(BASE_URL + firebasePath + ".json", {
            method: "PUT", // Oder "PATCH", wenn du die Daten nur aktualisieren möchtest
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(subtaskStatuses)
        });
        console.log(`Subtask statuses for task ${taskId} saved to Firebase.`);
    } catch (error) {
        console.error('Error saving subtask statuses to Firebase:', error);
    }
}



async function loadSubtaskProgress(taskId) {
    const savedStatuses = await getSavedStatusesFromFirebase(taskId); // Load saved statuses (true/false) from Firebase
    const subtaskImages = getSubtaskImages(taskId); // Get the subtask images (checkboxes)

    if (subtaskImages.length > 0) {
        applySavedStatuses(subtaskImages, savedStatuses); // Update the checkboxes based on saved statuses
        updateProgressBarFromFirebase(taskId); // Update the progress bar based on the saved statuses
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const subtaskImages = getSubtaskImages(taskId);
            if (subtaskImages.length > 0) {
                applySavedStatuses(subtaskImages, savedStatuses);
                updateProgressBarFromFirebase(taskId);
            }
        });
    }
}


async function getSavedStatusesFromFirebase(taskId) {
    const response = await fetch(BASE_URL + `tasks/task${taskId}/subtaskStatuses.json`);
    const savedStatuses = await response.json();
    return savedStatuses || []; // Return an empty array if no statuses are found
}

function applySavedStatuses(subtaskImages, savedStatuses) {
    subtaskImages.forEach((img, index) => {
        img.src = savedStatuses[index] ? '/assets/img/img_add_task/checkesbox.png' : '/assets/img/img_add_task/checkbox.png';
    });
}
async function fetchTasks() {
    try {
        const response = await fetch(BASE_URL + 'tasks.json');
        const data = await response.json();

        // Check if tasks exist
        if (!data) {
            console.error('No tasks data found');
            return [];
        }

        // Create a dynamic list of tasks
        const tasks = Object.keys(data).map(taskId => ({
            id: taskId, // Use the dynamic task ID
            ...data[taskId] // Spread the rest of the task data
        }));

        console.log('Fetched tasks:', tasks);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}




async function openPopup(taskId) {
    const taskData = await fetchTaskData(taskId);
    currentTaskData = { taskId, ...taskData };

    document.body.style.overflowY = "hidden";
    const assignedHtml = generateAssignedHtml2(taskData.assignedPeople);
    const subtasksHtml = generateSubtasksHtml(taskData.subtaskText, taskId);
    const priorityImage = getPriorityImage(taskData.priorityText);
    const headerBackgroundColor = getHeaderBackgroundColor(taskData.userStoryText);

    displayPopup(taskId, headerBackgroundColor, taskData, priorityImage, assignedHtml, subtasksHtml);

    // Lade die Subtask-Progress-Daten aus der Datenbank und setze die Checkbox-Bilder
    await loadSubtaskProgress(taskId);
}


async function fetchTaskData(taskId) {
    const [userStoryText, titleText, dueDate, descriptionText, subtaskText, priorityText, assignedPeople] = await Promise.all([
        userStory(`tasks/task${taskId}/category`),
        title(`tasks/task${taskId}/title`),
        dateFB(`tasks/task${taskId}/date`),
        descriptionFB(`tasks/task${taskId}/description`),
        subtaskFB(`tasks/task${taskId}/subtask`),
        priorityFB(`tasks/task${taskId}/priority`),
        assignedFB(`tasks/task${taskId}/assigned`)
    ]);
    return { userStoryText, titleText, dueDate, descriptionText, subtaskText, priorityText, assignedPeople: assignedPeople || [] };
}

function generateSubtasksHtml(subtaskText, taskId) {
    const subtasks = Array.isArray(subtaskText) ? subtaskText : subtaskText.split(',').filter(subtask => subtask.trim() !== '');
    if (subtasks.length === 0) return '<p>No subtasks available.</p>';
    return subtasks.map((subtask, index) => `
        <div class="subtask flex" onclick="toggleCheckbox(${index}, ${taskId})">
            <img src="/assets/img/img_add_task/checkbox.png" id="popup-subtask-${index}" name="subtask-${index}" style="height: 16px">
            <label for="popup-subtask-${index}">${subtask.trim()}</label>
        </div>`).join('');
}

function getHeaderBackgroundColor(userStoryText) {
    const colors = {
        'Technical Task': '#1FD7C1',
        'User Story': '#0038FF'
    };
    return colors[userStoryText] || '#FFF';
}

function displayPopup(taskId, headerBackgroundColor, taskData, priorityImage, assignedHtml, subtasksHtml) {
    const popup = document.getElementById('popup-tasks');
    popup.style.display = 'flex';
    popup.innerHTML = HtmlPopup(
        taskId, headerBackgroundColor,
        taskData.userStoryText, taskData.titleText, taskData.descriptionText,
        taskData.dueDate, taskData.priorityText, priorityImage,
        assignedHtml, subtasksHtml
    );
}
function generateAssignedHtml2(assignedPeople) {
    if (assignedPeople.length === 0) return '<p>No one assigned</p>';
    return assignedPeople.map(person => {
        const initials = person.name.split(' ').map(name => name[0]).join('');
        return `
        <div>
            <span class="assignee" style="background-color: ${person.color}; border-radius: 50%; display: inline-block; width: 30px; height: 30px; text-align: center; color: #fff;">
                ${initials}
            </span>
            <p>${person.name}<p>
        </div>`;
    }).join('');
}


let isSaving = false; // Flag zum Überprüfen, ob gerade gespeichert wird

async function toggleCheckbox(index, taskId) {
    if (isSaving) return; // Wenn gerade gespeichert wird, keine weiteren Klicks zulassen

    isSaving = true; // Setze das Flag auf true, um anzuzeigen, dass jetzt gespeichert wird

    const imgElement = document.getElementById(`popup-subtask-${index}`);
    const isChecked = imgElement.src.includes('checkbox.png'); // Überprüfen, ob das aktuelle Bild die nicht markierte Checkbox ist

    // Ändere das Bild der Checkbox basierend auf dem aktuellen Zustand
    imgElement.src = isChecked ? '/assets/img/img_add_task/checkesbox.png' : '/assets/img/img_add_task/checkbox.png';

    // Speichere den neuen Zustand der Checkbox in Firebase
    await saveCheckboxState(taskId, index, !isChecked);

    // Aktualisiere den Fortschritt erst nach der erfolgreichen Speicherung
    updateProgress(taskId);

    isSaving = false; // Setze das Flag zurück, nachdem das Speichern abgeschlossen ist
}



async function selctedAssignees(taskId) {
    const assignedPeople = await assignedFB(`tasks/task${taskId}/assigned`);
    resetDropdownItems();
    highlightAssignedPeople(assignedPeople);
}

function resetDropdownItems() {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.setAttribute('data-selected', 'false');
        const img = item.querySelector('.toggle-image');
        img.src = '/assets/img/img_add_task/checkbox.png';
        img.alt = 'Unselected';
        item.style.backgroundColor = '';
        item.style.color = '';
    });
}

function highlightAssignedPeople(assignedPeople) {
    if (!assignedPeople || assignedPeople.length === 0) {
        // No one is assigned, so just return or handle accordingly
        console.log('No one assigned to this task.');
        return;
    }

    assignedPeople.forEach(person => {
        const dropdownItem = document.querySelector(`.dropdown-item[data-name="${person.name}"]`);
        if (dropdownItem) {
            setItemSelected(dropdownItem);
        }
    });
}

function setItemSelected(item) {
    item.setAttribute('data-selected', 'true');
    const img = item.querySelector('.toggle-image');
    img.src = '/assets/img/img_add_task/checkedbox.png';
    img.alt = 'Selected';
    item.style.backgroundColor = '#2A3647';
    item.style.color = 'white';
}


async function openEdit(taskId) {
    await selctedAssignees(taskId);
    const taskData = await fetchTaskData(taskId);
    const assignedHtml = generateAssignedHtml(taskData.assignedPeople);

    displayEditPopup(taskId, taskData, assignedHtml);
    loadSubtasksIntoEditForm(taskId, taskData.subtaskText);



    // Reattach event listeners for prio buttons
    document.querySelectorAll('.prio-button').forEach(function (button) {
        button.addEventListener('mouseover', handleMouseOver);
        button.addEventListener('mouseout', handleMouseOut);
        button.addEventListener('click', handleClick);
    });
}


function displayEditPopup(taskId, taskData, assignedHtml) {
    document.getElementById(`popup-task${taskId}`).style.height = '80%';
    const edit = document.getElementById(`popup-task${taskId}`);
    edit.innerHTML = HtmlEdit(taskData.titleText, taskData.descriptionText, taskId, assignedHtml, taskData.dueDate, taskData.priorityText, taskData.userStoryText);
}

function loadSubtasksIntoEditForm(taskId, subtaskText) {
    if (typeof subtaskText === 'string') {
        const subtasks = subtaskText.split(',').filter(subtask => subtask.trim() !== '');
        populateSubtaskList(taskId, subtasks);
    } else {
        console.error('subtaskText is not a string:', subtaskText);
    }
}

function populateSubtaskList(taskId, subtasks) {
    const subtaskList = document.getElementById('subtask-list');
    subtaskList.innerHTML = subtasks.map((subtask, index) => `
        <div id="subtask-${index}" style="display: flex; align-items: center;">
            <p class="subtask" contenteditable="true" style="flex-grow: 1;">${subtask.trim()}</p>
            <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtasks(${index})">
        </div>
    `).join('');

    subtasks.forEach((_, index) => addSubtaskInputListener(taskId, index));
}

function addSubtaskInputListener(taskId, index) {
    const subtaskElement = document.querySelector(`#subtask-${index} .subtask`);
    subtaskElement.addEventListener('input', () => updateSubtaskInLocalStorage(taskId, index, subtaskElement.textContent));
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
    const subtaskText = getSubtaskInputValue();
    if (!subtaskText) return;

    const index = appendSubtaskToList(taskId, subtaskText);
    clearSubtaskInput();
    updateSubtasksInFirebase(taskId);
}

function getSubtaskInputValue() {
    const input = document.getElementById('subtask-input');
    return input.value.trim();
}

function appendSubtaskToList(taskId, subtaskText) {
    const subtaskList = document.getElementById('subtask-list');
    const index = subtaskList.children.length;

    const subtaskItem = createSubtaskElement(index, subtaskText);
    addInputListener(taskId, index, subtaskItem);

    subtaskList.appendChild(subtaskItem);
    return index;
}

function createSubtaskElement(index, subtaskText) {
    const subtaskItem = document.createElement('div');
    subtaskItem.id = `subtask-${index}`;
    subtaskItem.style.display = 'flex';
    subtaskItem.style.alignItems = 'center';
    subtaskItem.innerHTML = `
        <p class="subtask" contenteditable="true" style="flex-grow: 1;">${subtaskText}</p>
        <img src="/assets/img/delete.png" alt="Delete" style="cursor: pointer;" onclick="removeSubtasks(${index})">
    `;
    return subtaskItem;
}

function addInputListener(taskId, index, subtaskItem) {
    const subtaskElement = subtaskItem.querySelector('.subtask');
    subtaskElement.addEventListener('input', () => updateSubtaskInLocalStorage(taskId, index, subtaskElement.textContent));
}

function clearSubtaskInput() {
    document.getElementById('subtask-input').value = '';
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
function filterSubtasks(subtaskString, subtaskToDelete) {
    return subtaskString.split(',').filter(subtask => subtask.trim() !== subtaskToDelete.trim());
}

async function updateSubtasks(path, updatedSubtaskString) {
    const response = await fetch(BASE_URL + path + ".json", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtask: updatedSubtaskString })
    });
    return await response.json();
}



function putOnFb(taskId) {
    const taskData = collectTaskData();
    if (!validateTaskData(taskData)) return;

    const newSubtasks = collectNewSubtasks();
    const subtaskStatuses = newSubtasks.map(() => false);  // Initialize all subtasks as unchecked (false)

    mergeAndSaveSubtasks(taskId, newSubtasks, taskData)
        .then(() => {
            // Send the subtask statuses to Firebase
            return fetch(BASE_URL + `tasks/task${taskId}/subtaskStatuses.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subtaskStatuses)
            });
        })
        .then(() => {
            // After subtasks are saved, add task to column0
            addToColumn0(taskId);
        })
        .catch(console.error);
}


function addToColumn0(taskId) {
    // Hole die aktuellen Tasks in column0
    fetch('https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions/column0.json')
        .then(response => response.json())
        .then(column0Tasks => {
            // Wenn keine Tasks vorhanden sind, erstelle ein leeres Array
            if (!Array.isArray(column0Tasks)) {
                column0Tasks = [];
            }

            // Füge die neue Task-ID hinzu
            column0Tasks.push(`task${taskId}`);

            // Speichere die aktualisierte Liste in Firebase
            return fetch('https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/tasksPositions/column0.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(column0Tasks),
            });
        })
        .then(response => response.json())
        .then(() => {
            console.log(`Task ${taskId} erfolgreich zu column0 hinzugefügt.`);
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen der Task zu column0:', error);
        });
}

function collectTaskData() {
    return {
        title: document.getElementById('title-input').value,
        description: document.getElementById('description-input').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        priority: document.querySelector('.prio-button.clicked')?.alt || 'low'
    };
}

function validateTaskData({ title, date, category }) {
    return title && date && category;
}

function collectNewSubtasks() {
    return Array.from(document.querySelectorAll('#subtask-list .subtask')).map(p => p.textContent.trim());
}

function mergeAndSaveSubtasks(taskId, newSubtasks, taskData) {
    subtaskFB(`tasks/task${taskId}/subtask`).then(existingSubtasks => {
        const existingSubtaskArray = Array.isArray(existingSubtasks) ? existingSubtasks : existingSubtasks.split(',').filter(subtask => subtask.trim() !== '');
        const combinedSubtasks = [...newSubtasks, ...existingSubtaskArray].filter((subtask, index, self) => self.indexOf(subtask) === index);

        taskData.subtask = combinedSubtasks.join(',');
        taskData.assigned = getSelectedContacts();

        saveTaskToFb(taskId, taskData);
    }).catch(console.error);
}

function saveTaskToFb(taskId, taskData) {
    putData(`tasks/task${taskId}`, taskData)
        .then(() => window.location.href = '/html/board.html')
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
        return [];
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
        // Step 1: Delete the task from Firebase
        const taskPath = `${BASE_URL}tasks/task${taskId}.json`;
        const deleteResponse = await fetch(taskPath, {
            method: 'DELETE',
        });

        if (!deleteResponse.ok) {
            throw new Error(`Error deleting task ${taskId}`);
        }

        console.log(`Task ${taskId} deleted successfully.`);

        // Step 2: Fetch all remaining tasks
        const tasksResponse = await fetch(`${BASE_URL}tasks.json`);
        const tasksData = await tasksResponse.json();

        if (!tasksData) {
            console.error('No tasks found in Firebase.');
            return;
        }

        // Step 3: Create an array of remaining tasks
        let remainingTasks = [];
        Object.keys(tasksData).forEach((key) => {
            remainingTasks.push({
                id: key,
                data: tasksData[key],
            });
        });

        // Step 4: Sort the tasks by their current task number (if not already sorted)
        remainingTasks.sort((a, b) => {
            const taskANumber = parseInt(a.id.replace('task', ''), 10);
            const taskBNumber = parseInt(b.id.replace('task', ''), 10);
            return taskANumber - taskBNumber;
        });

        // Step 5: Renumber the remaining tasks starting from task1
        const renumberedTasks = {};
        remainingTasks.forEach((task, index) => {
            const newTaskId = `task${index + 1}`;
            renumberedTasks[newTaskId] = task.data;  // Add the task data to the new task ID
        });

        // Step 6: Clear the tasks in Firebase (optional, to avoid conflicts)
        await fetch(`${BASE_URL}tasks.json`, {
            method: 'DELETE',
        });

        // Step 7: Save renumbered tasks back to Firebase
        await fetch(`${BASE_URL}tasks.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(renumberedTasks),
        });

        closePopup();
        window.location.href = "../html/board.html";

    } catch (error) {
        console.error('Error deleting and renumbering tasks:', error);
    }
}


async function updateTaskPositionsAfterDeletion(taskId) {
    try {
        // Fetch current task positions from Firebase
        const response = await fetch(BASE_URL + 'tasksPositions.json');
        const tasksPositions = await response.json();

        // Loop through all columns and remove the task ID
        Object.keys(tasksPositions).forEach(columnKey => {
            tasksPositions[columnKey] = tasksPositions[columnKey].filter(id => id !== `task${taskId}`);
        });

        // Update the tasksPositions in Firebase
        await fetch(BASE_URL + 'tasksPositions.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tasksPositions),
        });

        console.log(`Task ${taskId} successfully removed from task positions.`);
    } catch (error) {
        console.error('Error updating task positions:', error);
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

    document.body.style.overflowY = "scroll";
    if (popup) {
        popup.style.display = 'none';
        popup.innerHTML = '';
    }

    if (overlay) {
        overlay.style.display = 'none';
    }

    currentTaskData = {};
}

function filterTasks() {
    const searchTerm = document.getElementById('findTask').value.toLowerCase();
    const taskElements = document.querySelectorAll('.task');

    taskElements.forEach(taskElement => {
        const titleText = taskElement.querySelector('h3').textContent.toLowerCase();
        const descriptionText = taskElement.querySelector('p').textContent.toLowerCase();

        if (titleText.includes(searchTerm) || descriptionText.includes(searchTerm)) {
            taskElement.style.display = '';
        } else {
            taskElement.style.display = 'none';
        }
    });
}

function updateSubtaskInLocalStorage(taskId, subtaskIndex, newText) {
    const savedStatuses = JSON.parse(localStorage.getItem(`task-${taskId}-subtasks`)) || [];

    while (savedStatuses.length <= subtaskIndex) {
        savedStatuses.push(false);
    }

    const existingSubtasks = JSON.parse(localStorage.getItem(`task-${taskId}-subtask-texts`)) || [];
    existingSubtasks[subtaskIndex] = newText.trim();
    localStorage.setItem(`task-${taskId}-subtask-texts`, JSON.stringify(existingSubtasks));

    console.log(`Subtask ${subtaskIndex} updated to: ${newText}`);

    updateSubtasksInFirebase(taskId);
}

document.getElementById('findTask').addEventListener('input', filterTasks);