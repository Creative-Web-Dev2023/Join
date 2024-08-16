document.querySelectorAll('.prio-button').forEach(function(button) {
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
    document.querySelectorAll('.prio-button').forEach(function(btn) {
        if (btn !== this) {
            btn.classList.remove('clicked');
            if (btn.src.includes('_clicked')) {
                btn.src = btn.src.replace('_clicked', '_standart');
            }
        }
    }, this);

    this.classList.add('clicked');
    if (this.src.includes('_hover')) {
        this.src = this.src.replace('_hover', '_clicked');
    } else if (this.src.includes('_standart')) {
        this.src = this.src.replace('_standart', '_clicked');
    }
}

function error() {
    let text = document.getElementById('title-input');
    let category = document.getElementById('category');
    let date = document.getElementById('date');
    let isEmpty = false;

    isEmpty = validateField(text, 'Please fill out this field.') || isEmpty;
    isEmpty = validateField(category, 'Please fill out this field.') || isEmpty;
    isEmpty = validateField(date, 'Please fill out this field.') || isEmpty;
}

function validateField(field, message) {
    if (field.value.trim() === '') {
        setError(field, message);
        return true;
    } else {
        clearError(field);
        return false;
    }
}

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

function resetInput() {
    window.location.href = '/html/add_task.html';
}
