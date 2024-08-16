function HtmlEdit(titleText, descriptionText, taskId, assignedHtml, dueDate, priorityText, userStoryText) {
    return `
    <div>
    <form>
        <div class="first-container">
        <div class="form-content">
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
                    <img class="prio-button ${priorityText === 'Urgent' ? 'clicked' : ''}" id="urgent" src="/assets/img/img_add_task/urgent_${priorityText === 'Urgent' ? 'clicked' : 'standart'}.png" alt="Urgent">
                    <img class="prio-button ${priorityText === 'Medium' ? 'clicked' : ''}" id="medium" src="/assets/img/img_add_task/medium_${priorityText === 'Medium' ? 'clicked' : 'standart'}.png" alt="Medium">
                    <img class="prio-button ${priorityText === 'Low' ? 'clicked' : ''}" id="low" src="/assets/img/img_add_task/low_${priorityText === 'Low' ? 'clicked' : 'standart'}.png" alt="Low">
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
                    <div id="add-subtask-btn" onclick="addSubtasks(${taskId})"></div>
                </div>
                <ul id="subtask-list" class="subtask-list"></ul>
            </div>
        </div>
            <div class="div-button-edit">
                <div type="button" class="edit-button" onclick="putOnFb(${taskId}), error()"><p>Ok</p> <img src="/assets/img/img_board/check.png"></div>
            </div>
        </div>
    </form>
    </div>
    `;
}

function HtmlPopup(taskId, headerBackgroundColor, userStoryText, titleText, descriptionText, dueDate, priorityText, priorityImage, assignedHtml, subtasksHtml) {
    return `
    <div class="popup-content-task" id="popup-task${taskId}">
        <div class="user-story-popup">
            <div class="header-popup-cross">
                <div class="task-header-pop-up user-story" style="background: ${headerBackgroundColor};">${userStoryText}</div>
                <span class="close-button" onclick="closePopup()">&times;</span>
            <div>    
            <h2 class="h1-popup">${titleText}</h2>
            <p>${descriptionText}</p>
            <div class="flex">
                <p class="hardfont">Due date:</p>
                <p class="reactivefonts">${dueDate}</p>
            </div>
            <div class="flex">
                <p class="hardfont">Priority:</p>
                <p class="reactivefonts">${priorityText} <img src="${priorityImage}" style="width: 15px; height: 15px;"></p>
            </div>
            <p class="hardfont">Assigned To:</p>
            <div class="assigned-popup-split2">
            ${assignedHtml}
            </div>
            <p class="hardfont">Subtasks</p>
            <div class="task-subtasks reactivefont">
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

function HtmlTaskElement(headerBackgroundColor, userStoryText, titleText, descriptionText, progressBarHtml, assignedHtml, priorityImage) {
    return `
        <div class="task-header user-story"  style="background: ${headerBackgroundColor};">${userStoryText}</div>
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
}

function HtmlProgressBar(index, subtaskCount) {
    return `
            <div class="task-progress">
                <div class="progress-bar" id="progress-bar-${index + 1}" style="width: 0%;"></div>
            </div>
            <p class="subtask-counter" id="subtask-count-${index + 1}">0/${subtaskCount} Subtasks</p>
        `;
}