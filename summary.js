function greet() {
    const greetingElement = document.getElementById('greeting');
    const now = new Date();
    const hours = now.getHours();

    let greetingText;
    if (hours < 12) {
        greetingText = 'Good Morningggg';
    } else if (hours < 18) {
        greetingText = 'Good Afternoon';
    } else if (hours < 22) {
        greetingText = 'Good Evening';
    } else {
        greetingText = 'Good Night';
    }

    greetingElement.textContent = greetingText;
};