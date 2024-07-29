function addToBoard() {
    let text = document.getElementById('title-input');
    let category = document.getElementById('category');
    let date = document.getElementById('date');

    let isEmpty = false;

    if (text.value.trim() === '') {
        text.style.border = '1px solid #FF8190';
        isEmpty = true;
    } else {
        text.style.border = '1px solid #D1D1D1';
    }

    if (category.value.trim() === '') {
        category.style.border = '1px solid #FF8190';
        isEmpty = true;
    } else {
        category.style.border = '1px solid #D1D1D1';
    }

    if (date.value.trim() === '') {
        date.style.border = '1px solid #FF8190';

        isEmpty = true;
    } else {
        date.style.border = '1px solid #D1D1D1';
    }

    if (isEmpty) {
        console.log('Please fill in all fields.');
    } else {
        console.log('All fields are filled. Proceeding...');
        text.value = '';
        category.value = '';
        date.value = '';
    }
}
