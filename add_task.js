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
        // Remove clicked state from all buttons and reset their images
        document.querySelectorAll('.prio-button').forEach(function(btn) {
            if (btn !== button) {
                btn.classList.remove('clicked');
                if (btn.src.includes('_clicked')) {
                    btn.src = btn.src.replace('_clicked', '_standart');
                }
            }
        });

        // Add clicked state to the clicked button and set the clicked image
        this.classList.add('clicked');
        if (this.src.includes('_hover')) {
            this.src = this.src.replace('_hover', '_clicked');
        } else if (this.src.includes('_standart')) {
            this.src = this.src.replace('_standart', '_clicked');
        }
    });
});

function addToBoard() {
    let text = document.getElementById('title-input');
    let category = document.getElementById('category');
    let date = document.getElementById('date');

    // Function to set error message
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

    // Function to clear error message
    function clearError(field) {
        field.style.border = '1px solid #D1D1D1';
        let errorElement = field.nextElementSibling;
        if (errorElement && errorElement.className === 'error-message') {
            errorElement.remove();
        }
    }

    // Initialize a flag to check if any field is empty
    let isEmpty = false;

    // Check if the text field is empty
    if (text.value.trim() === '') {
        setError(text, 'Please fill out this field.');
        isEmpty = true;
    } else {
        clearError(text);
    }

    // Check if the category field is empty
    if (category.value.trim() === '') {
        setError(category, 'Please fill out this field.');
        isEmpty = true;
    } else {
        clearError(category);
    }

    // Check if the date field is empty
    if (date.value.trim() === '') {
        setError(date, 'Please fill out this field.');
        isEmpty = true;
    } else {
        clearError(date);
    }

    // If any field is empty, display a general error message
    if (isEmpty) {
        console.log('Please fill in all fields.');
    } else {
        console.log('All fields are filled. Proceeding...');

        // Clear the fields if all are filled
        text.value = '';
        category.value = '';
        date.value = '';

        // Reset the buttons to standard state
        document.querySelectorAll('.prio-button').forEach(function(button) {
            button.classList.remove('clicked');
            button.src = button.src.replace('_clicked', '_standart');
        });
    }
}
