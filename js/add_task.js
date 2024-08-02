// Array to store tasks
const tasks = [];

// Initialize event listeners for priority buttons and title input
document.querySelectorAll('.prio-button').forEach(function(button) {
    button.addEventListener('mouseover', function() {
        if (!this.classList.contains('clicked')) {
            const hoverSrc = this.src.replace('_standart', '_hover');
            this.src = hoverSrc;
        }
    });

    button.addEventListener('mouseout', function() {
        if (!this.classList.contains('clicked')) {
            const standartSrc = this.src.replace('_hover', '_standart');
            this.src = standartSrc;
        }
    });

    button.addEventListener('click', function() {
        document.querySelectorAll('.prio-button').forEach(function(btn) {
            if (btn !== button) {
                btn.classList.remove('clicked');
                if (btn.src.includes('_clicked')) {
                    btn.src = btn.src.replace('_clicked', '_standart');
                }
            }
        });

        this.classList.add('clicked');
        if (this.src.includes('_hover')) {
            this.src = this.src.replace('_hover', '_clicked');
        } else if (this.src.includes('_standart')) {
            this.src = this.src.replace('_standart', '_clicked');
        }
    });
});

// Add event listener to handle pressing "Enter" in the title input
document.getElementById("title-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addToBoard();
    }
});

function addToBoard() {
    // Get form input values
    let text = document.getElementById('title-input');
    let description = document.querySelector('textarea').value.trim();
    let assignedTo = document.querySelector('select[name="Selects contacts to assign"]').value;
    let category = document.getElementById('category');
    let date = document.getElementById('date');

    // Get selected priority
    let priority = '';
    document.querySelectorAll('.prio-button').forEach(function(button) {
        if (button.classList.contains('clicked')) {
            if (button.id === 'urgent') priority = 'Urgent';
            if (button.id === 'medium') priority = 'Medium';
            if (button.id === 'low') priority = 'Low';
        }
    });

    function setError(field, message) {
        field.style.border = '1px solid #FF8190';
        let errorElement = field.nextElementSibling;
        if (errorElement && errorElement.className === 'error-message') {
            errorElement.textContent = message;
        } else {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = '#FF8190';
            errorElement.textContent = message;
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
    }

    function clearError(field) {
        field.style.border = '1px solid #D1D1D1';
        let errorElement = field.nextElementSibling;
        if (errorElement && errorElement.className === 'error-message') {
            errorElement.remove();
        }
    }

    let isEmpty = false;

    if (text.value.trim() === '') {
        setError(text, 'Please fill out this field.');
        isEmpty = true;
    } else {
        clearError(text);
    }

    if (category.value.trim() === '') {
        setError(category, 'Please fill out this field.');
        isEmpty = true;
    } else {
        clearError(category);
    }

    if (date.value.trim() === '') {
        setError(date, 'Please fill out this field.');
        isEmpty = true;
    } else {
        clearError(date);
    }

    if (isEmpty) {
        console.log('Please fill in all required fields.');
    } else {
        console.log('All required fields are filled. Proceeding...');
        
        // Create a task object
        const task = {
            title: text.value.trim(),
            description: description,
            assignedTo: assignedTo,
            dueDate: date.value,
            priority: priority,
            category: category.value,
        };

        // Add the task object to the tasks array
        tasks.push(task);

        // Log tasks array to verify data
        console.log('Task added:', task);
        console.log('All tasks:', tasks);

        // Clear form fields after submission
        text.value = '';
        document.querySelector('textarea').value = '';
        document.querySelector('select[name="Selects contacts to assign"]').selectedIndex = 0;
        category.selectedIndex = 0;
        date.value = '';

        document.querySelectorAll('.prio-button').forEach(function(button) {
            button.classList.remove('clicked');
            button.src = button.src.replace('_clicked', '_standart');
        });
    }
}

function resetInput() {
    window.location.href = '/html/add_task.html';
    console.log('cleared inputs');
}
