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
