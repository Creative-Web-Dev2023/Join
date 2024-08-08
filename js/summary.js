function getGreeting() {
    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 12) {
        greeting = "Good morning!";
    } else if (currentHour < 18) {
        greeting = "Good afternoon!";
    } else {
        greeting = "Good evening!";
    }

    return greeting;
}

document.addEventListener('DOMContentLoaded', () => {
    const isGuest = localStorage.getItem('isGuest');
    const fullName = localStorage.getItem('fullName');
    const greetingElement = document.getElementById('greeting');
    const greetedNameElement = document.getElementById('greeted-name');

    if (isGuest === 'true') {
        greetingElement.textContent = getGreeting();
        greetedNameElement.textContent = "Guest";
    } else if (fullName) {
        greetingElement.textContent = getGreeting();
        greetedNameElement.textContent = fullName;
    } else {
        greetingElement.textContent = "Willkommen auf unserer Seite.";
        greetedNameElement.textContent = "";
    }
});
document.addEventListener('DOMContentLoaded', summaryCounts);
function summaryCounts() {
    todoCount();
    doneCount();
    progressCount();
    feedbackCount();
    allCount();
}

function allCount() {
    const tasksPositionsString = localStorage.getItem('tasksPositions');
    const tasksPositions = JSON.parse(tasksPositionsString);
    let all = document.getElementById('allCounter')

    let totalTasks = 0;
    for (const column in tasksPositions) {
        if (tasksPositions.hasOwnProperty(column)) {
            totalTasks += tasksPositions[column].length;
        }
    }

    all.innerHTML = `
    ${totalTasks}
    `;

    console.log('Total number of tasks:', totalTasks);
}

function openTaskBoard() {
    window.location.href = './board.html';
}

function todoCount() {
    const tasksPositionsString = localStorage.getItem('tasksPositions');
    const tasksPositions = JSON.parse(tasksPositionsString);
    const column0Tasks = tasksPositions.column0;
    let todo = document.getElementById('todoCounter')

    console.log(column0Tasks.length);
    todo.innerHTML = `
    ${column0Tasks.length}
    `;
}

function progressCount() {
    const tasksPositionsString = localStorage.getItem('tasksPositions');
    const tasksPositions = JSON.parse(tasksPositionsString);
    const column1Tasks = tasksPositions.column1;
    let todo = document.getElementById('progressCounter')

    console.log(column1Tasks.length);
    todo.innerHTML = `
    ${column1Tasks.length}
    `;
}

function feedbackCount() {
    const tasksPositionsString = localStorage.getItem('tasksPositions');
    const tasksPositions = JSON.parse(tasksPositionsString);
    const column2Tasks = tasksPositions.column2;
    let todo = document.getElementById('feedbackCounter')

    console.log(column2Tasks.length);
    todo.innerHTML = `
    ${column2Tasks.length}
    `;
}

function doneCount() {
    const tasksPositionsString = localStorage.getItem('tasksPositions');
    const tasksPositions = JSON.parse(tasksPositionsString);
    const column3Tasks = tasksPositions.column3;
    let todo = document.getElementById('doneCounter')

    console.log(column3Tasks.length);
    todo.innerHTML = `
    ${column3Tasks.length}
    `;
}