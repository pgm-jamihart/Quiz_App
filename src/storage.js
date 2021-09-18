// function save data to local storage 
const writeToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
// function read data from local storage 
const readFromStorage = key => JSON.parse(localStorage.getItem(key)) || [];
// function save data to session storage 
const writeToSessionStorage = (key, data) => sessionStorage.setItem(key, JSON.stringify(data));
// function read data from session storage 
const readToSessionStorage = key => JSON.parse(sessionStorage.getItem(key)) || [];

export {
  readFromStorage,
  writeToStorage,
  readToSessionStorage,
  writeToSessionStorage,
};