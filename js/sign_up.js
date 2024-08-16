


function validatePasswords() {
    const password = document.getElementById('password').value; 
    const confirmPassword = document.getElementById('confirmPassword').value; 
    const passwordError = document.getElementById('passwordError'); 
    const privacyPolicy = document.getElementById('privacyPolicy'); 
    resetError(passwordError); 
    
    if (!arePasswordsMatching(password, confirmPassword, passwordError)) {
        return false; 
    }
    
    if (!isPrivacyPolicyAccepted(privacyPolicy, passwordError)) {
        return false; 
    }
    return true; 
}


function resetError(errorElement) {
    errorElement.style.display = 'none'; 
}


function arePasswordsMatching(password, confirmPassword, errorElement) {
    if (password === confirmPassword) {
        return true; 
    }
    showError(errorElement, 'Passwords do not match.'); 
    return false; 
}


function isPrivacyPolicyAccepted(privacyPolicyCheckbox, errorElement) {
    if (privacyPolicyCheckbox.checked) {
        return true; 
    }
    showError(errorElement, 'Please accept the privacy policy.'); 
    return false; 
}


function showError(errorElement, message) {
    errorElement.textContent = message; 
    errorElement.style.display = 'block'; 
}


function showSuccessPopup() {
    const successPopup = document.getElementById('successPopup'); 
    successPopup.style.display = 'block'; 
    setTimeout(() => {
        successPopup.style.bottom = '50%'; 
    }, 0);
    setTimeout(() => {
        successPopup.style.display = 'none'; 
        window.location.href = '/html/summary.html'; 
    }, 1500);
}


function togglePasswordVisibility(id) {
    const input = document.getElementById(id); 
    if (input.type === 'password') {
        input.type = 'text'; 
    } else {
        input.type = 'password'; 
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const signUpButton = document.getElementById('signUpButton'); 
    const inputs = document.querySelectorAll('#signupForm input[required]'); 
    const privacyPolicy = document.getElementById('privacyPolicy'); 
    
    function checkInputs() {
        const allFilled = areInputsFilled(inputs); 
        signUpButton.disabled = !(allFilled && privacyPolicy.checked); 
    }
    
    inputs.forEach(input => input.addEventListener('input', checkInputs));
    
    privacyPolicy.addEventListener('change', checkInputs);
    checkInputs(); 
});


function areInputsFilled(inputs) {
    return Array.from(inputs).every(input => input.value.trim() !== ''); 
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.(de|com)$/;
    return emailPattern.test(email);
}

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    
    submitContactFB(event);
});

async function submitContactFB(event) {
    

    let contactName = document.getElementById("fullName").value;
    let contactEmail = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    let isValid = true;

    
    if (!validatePasswords()) {
        isValid = false;
    }

    if (!validateEmail(contactEmail)) {
        emailError.textContent = 'Please enter a valid email address ending in .de or .com';
        emailError.style.display = 'block';
        isValid = false;
    }

    if (!contactName || !contactEmail) {
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    let contactData = {
        name: contactName,
        email: contactEmail,
        color: generateRandomColor(),
        emblem: generateEmblem(contactName),
        password: password
    };

    try {
        await addContactToFirebase(contactData);

        localStorage.setItem('fullName', contactName);
        localStorage.setItem('isGuest', 'false');

        showSuccessPopup();

        document.getElementById("fullName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirmPassword").value = "";

    } catch (error) {
        console.error("Failed to submit contact data:", error);
    }
}



function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateEmblem(name) {
    const nameParts = name.trim().split(' ');
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const secondInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
    return firstInitial + secondInitial;
}

async function addContactToFirebase(contactData) {
    let BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";

    try {
        let response = await fetch(BASE_URL + "contacts.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(contactData),
        });

        if (!response.ok) {
            console.error("Failed to set data to Firebase:", response.statusText);
            return {};
        }

        let responseData = await response.json();

        const newContactId = responseData.name;

        return responseData;
    } catch (error) {
        console.error("Error setting data:", error);
        return {};
    }
}

