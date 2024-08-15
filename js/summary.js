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
const BASE_URL = 'https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/';

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

async function summaryCounts() {
    const tasksPositions = await fetchTasksPositions();
    todoCount(tasksPositions);
    doneCount(tasksPositions);
    progressCount(tasksPositions);
    feedbackCount(tasksPositions);
    allCount(tasksPositions);
}

async function fetchTasksPositions() {
    try {
        const response = await fetch(`${BASE_URL}tasksPositions.json`);
        const tasksPositions = await response.json();
        return tasksPositions;
    } catch (error) {
        console.error('Error fetching tasks positions:', error);
        return {};
    }
}

function allCount(tasksPositions) {
    let all = document.getElementById('allCounter');

    let totalTasks = 0;
    for (const column in tasksPositions) {
        if (tasksPositions.hasOwnProperty(column)) {
            totalTasks += tasksPositions[column].length;
        }
    }

    all.innerHTML = `
    ${totalTasks}
    `;
}

function todoCount(tasksPositions) {
    const column0Tasks = tasksPositions.column0 || [];
    let todo = document.getElementById('todoCounter');

    todo.innerHTML = `
    ${column0Tasks.length}
    `;
}

function progressCount(tasksPositions) {
    const column1Tasks = tasksPositions.column1 || [];
    let progress = document.getElementById('progressCounter');

    progress.innerHTML = `
    ${column1Tasks.length}
    `;
}

function feedbackCount(tasksPositions) {
    const column2Tasks = tasksPositions.column2 || [];
    let feedback = document.getElementById('feedbackCounter');

    feedback.innerHTML = `
    ${column2Tasks.length}
    `;
}

function doneCount(tasksPositions) {
    const column3Tasks = tasksPositions.column3 || [];
    let done = document.getElementById('doneCounter');

    done.innerHTML = `
    ${column3Tasks.length}
    `;
}

function openTaskBoard() {
    window.location.href = './board.html';
}
