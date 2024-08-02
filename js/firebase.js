// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyDT3bogY8aZNACSDdVicEsw7Lmm5DSUZlk",
    authDomain: "join-ec9c5.firebaseapp.com",
    databaseURL: "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-ec9c5",
    storageBucket: "join-ec9c5.appspot.com",
    messagingSenderId: "459785575949",
    appId: "1:459785575949:web:cc4cd565859d7fe685ff44",
    measurementId: "G-Z85K6WWVWZ"
};
console.log(firebaseConfig);
// Firebase initialisieren
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

// Auf Kontakte in der Realtime Database zugreifen
const contactsRef = database.ref('contacts');

// Daten abrufen
contactsRef.on('value', (snapshot) => {
    const contacts = snapshot.val();
    const contactList = document.getElementById('contactList');

    // Kontaktliste leeren
    contactList.innerHTML = '';

    // Kontakte durchgehen und anzeigen
    for (let id in contacts) {
        const contact = contacts[id];
        const listItem = document.createElement('li');
        listItem.textContent = `${contact.name} (${contact.email}) - ${contact.phone}`;
        contactList.appendChild(listItem);
    }
});
