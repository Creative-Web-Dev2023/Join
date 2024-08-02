  let title = document.getElementById('title-input');
  let description = document.querySelector('textarea').value.trim();
  let assigned = document.querySelector('select[name="Selects contacts to assign"]').value;
  let date = document.getElementById('date');
  let category = document.getElementById('category');
  let priority = '';
    document.querySelectorAll('.prio-button').forEach(function(button) {
        if (button.classList.contains('clicked')) {
            if (button.id === 'urgent') priority = 'Urgent';
            if (button.id === 'medium') priority = 'Medium';
            if (button.id === 'low') priority = 'Low';
        }
    });














  function init() {
    console.log('test');
    putData(`tasks/task001/title`, `${title}`);
  }

const BASE_URL = "https://join-ec9c5-default-rtdb.europe-west1.firebasedatabase.app/";

async function getData(path = "") {
  let eins = await fetch(BASE_URL + path + ".json");
  let zwei = await eins.json();

  console.log(zwei);
}

// key gets a random underkey plus added data string
async function postData(path = "", data = {}) {
  let eins = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    header: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });


  return zwei = await eins.json();
}

async function deleteData(path = "") {
  let eins = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",

  });


  return zwei = await eins.json();
}

// key plus string
// if i give path plus an array in the data field it gets  keys 0,1,2
async function putData(path = "", data = {}) {
  let eins = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    header: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });


  return zwei = await eins.json();
}

async function editData(id = 44, user = { name: 'kevin' }) {
  putData(`namen/${id}`, user);
}