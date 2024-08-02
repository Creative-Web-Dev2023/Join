let users= [
    { 'email':'John@gmail.com','passwort':'luis234'
    },


];

function addUser(){
    let email = document.getElementById('email').value;
    let password= document.getElementById('password').value;
    users.push({'email':email,'password':password});
}
