//HTMX WEBSOCKETS https://htmx.org/extensions/web-sockets/
//https://unpkg.com/htmx.org/dist/ext/ws.js

console.log("SuperRead(2) frontend init");
let socket = io();
let messages = document.getElementById('msg-ul');

let timeouts = [];

document.getElementById("msg").focus();

//HTMX
//clears input after send
document.getElementById("chat-form").addEventListener('htmx:xhr:loadstart', function(evt) {
    const form = document.querySelector("#msg");
    form.value = "";
});

//socket stuff
socket.on('greeting', function(msg) {
  console.log(msg);
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
});

socket.on('notifyAll', function(msg) {
  //console.log("notifyAll: " + msg);
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
});
socket.on('notifyAll_delayedRemove', function(msg) {
    //console.log("notifyAll: " + msg);
    var item = document.createElement('li');
    item.classList = "delayedRemove";
    item.textContent = msg;
    messages.appendChild(item);
    setTimeout(()=>item.remove(),5000)
});

socket.on('notification', function(msg) {
  console.log(msg);
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
});
socket.on('notification_delayedRemove', function(msg) {
    console.log(msg);
    var item = document.createElement('li');
    item.classList = "delayedRemove";
    item.textContent = msg;
    messages.appendChild(item);
    setTimeout(()=>item.remove(),5000)
});

socket.on('useriswriting', function(msg) {
    console.log(msg);
    var item = document.createElement('span');
    item.classList = "delayedRemove user-is-writing";
    item.id = "typing" + getUname();
    item.textContent = msg;

    //clearTimeout(timeouts[0]);
    if(!document.getElementById("typing" + getUname())){
        document.getElementById("additional-notifications").appendChild(item);
        timeouts[0] = setTimeout(()=>item.remove(),1500)
    }
});

socket.on('chatRefresh', function(msg) {
    const chat = document.getElementById("chat-view");
    const fh = chat.firstChild.offsetHeight + 10;
    chat.scrollTo(0,fh)
    setTimeout(()=>{
        chat.innerHTML = msg;
        chat.scrollTo(0,0)
    },200);
});

//username
const restoreUname = () => { //from localStorage
    let exists;
    if(localStorage.getItem("uname")){
        document.getElementById("uname").value = localStorage.getItem("uname").split("#")[0]
        true;
    } 
    socket.emit('whoami', getUname());
    return exists;
}
const storeUname = (uname) => {
    localStorage.setItem("uname", uname + "#" + Math.floor(Math.random() * 999999)  );
}
const getUname = () => {
    let uname = "🙈#"+ Math.floor(Math.random() * 999999);
    if(localStorage.getItem("uname")){
        uname = localStorage.getItem("uname");
    }
    return uname
}
const login = (el) => {
    const uname = localStorage.getItem("uname");
    socket.emit('whoami', uname);
    el.remove();
}

document.getElementById("uname").addEventListener("keyup",(e)=>storeUname(e.target.value));
document.getElementById("login").addEventListener("click",(e) => login(e.target));

restoreUname();

//nice features

//writing
document.getElementById("msg").addEventListener("keyup",(e)=>{
    socket.emit('iswriting', getUname());
});