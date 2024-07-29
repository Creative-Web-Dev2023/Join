function addToBoard() {
    let text = document.getElementById('title-input');
    let category = document.getElementById('category');
    let date = document.getElementById('date');

    let textError = documen

    if (text.value == 0, category.value == 0, date.value == 0) {
        text.style.border = '1px solid #FF8190';
        text.textContent = 'Fehler';
        date.textContent = 'falsch';
        category.style.border = '1px solid #FF8190';
        date.style.border = '1px solid #FF8190';
    } else {
        console.log('siper')
        text.value  = '';
        text.style.border = '1px solid #D1D1D1';
        category.value = '';
        category.style.border = '1px solid #D1D1D1';
        date.value = '';
        date.style.border = '1px solid #D1D1D1';
    }
}