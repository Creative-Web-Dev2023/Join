let BASE_URL = 'https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/' ;
let contacts= [];

async function init(){
    await loadContacts();
}

async function getDataFromFirebase(){
    let response = await fetch(BASE_URL + path +'.json');
    return await response.json();
}

async function setDataToFirebase(path ='', data = {}){
    let response = await fetch(BASE_URL + path +'.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function loadContacts() {
    let contactsData = await getDataFromFirebase('contacts');
    console.log('ContactsData:', contactsData);
    contacts = [];
    for (const key in contactsData) {
        const SINGLE_CONTACT = contactsData[key];
        let contact = {
            "id": key,
            "name": SINGLE_CONTACT.name,
            "email": SINGLE_CONTACT.email,
            "phone": SINGLE_CONTACT.phone,
            "emblem": SINGLE_CONTACT.emblem,  
            "color": SINGLE_CONTACT.color     
        };
        contacts.push(contact);
    }
    console.log('Contacts:', contacts);
}


async function addContact(){
    let contactName = document.getElementById('name').value;
    let contactEmail = document.getElementById('email').value;
    let contactPhone = document.getElementById('phone').value;
    let contactEmblem = document.getElementById('emblem').value; 
    let contactColor = document.getElementById('color').value; 

    let contactData = {
        "name": contactName,
        "email": contactEmail,
        "phone": contactPhone,
        "emblem": contactEmblem, 
        "color": contactColor   
    };
    await setDataToFirebase('contacts', newContact);
    await loadContacts();
    displayContacts();
}

function displayContacts() {
    const contactListElement = document.getElementById('contact-list');
    contactListElement.innerHTML = ''; 
    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.style.backgroundColor = contact.color; 
        contactElement.innerHTML = `
            <h3>${contact.name}</h3>
            <p>Email: ${contact.email}</p>
            <p>Phone: ${contact.phone}</p>
            <p>Emblem: ${contact.emblem}</p> 
        `;
        contactListElement.appendChild(contactElement);
    });
}
