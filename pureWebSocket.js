const {app,server,fs,fileName} = require('./pureWebSocketWorker.js');
const { Server } = require("socket.io");
const io = new Server(server);
//const fs = require('fs');

let users = [] // known users
let connections = [] //active connections

/*WEBSOCKET toiminnot*/
const notifyUser = (msg,chatRefresh) => {
    //console.log("Sending msg: " + msg);
    //console.log("tämä tapahtuu2");
    if(chatRefresh){
        io.emit("chatRefresh",fileContentsToHTML(msg));
    }else{
        io.emit("notification_delayedRemove",msg);
    }
}

//fileread
const readTextFile = async (fileName) => { //HTMX ready
    let data;
    try {
        data = await fs.readFileSync(fileName, 'utf8');
        return data
    } catch (err) {
        console.error(err);
    }
}

const fileContentsToHTML = (data) => {
    const _messages = data.split("\n")
    const messages = _messages.map(
        (onemsg,i) => {if(onemsg!="") return "<p class='row-"+i+"'>" + onemsg + "</p>"}
    ) 
    return messages.reverse().join('');    
}



io.on('connection', (socket) => {    
    //load chat on connection
    readTextFile(fileName).then((data)=>notifyUser(data,true));

    socket.on('disconnect', () => {
        console.log(connections);
        console.log('user disconnected');
        connections.splice(connections.findIndex( value => value == socket.id))
        console.log(connections);
    });
  
    console.log("user socket id: " + socket.id)
    if(!connections.includes(socket.id)){
        console.log(connections);
        console.log('a user connected');
        socket.broadcast.emit("notifyAll_delayedRemove",'🎊 Someone joined');
        connections.push(socket.id)
        console.log(connections);
    }
    

    socket.on('chatMessage', (msg) => {
        console.log('chat message -> ' + msg);
    });

    socket.on('whoamiRename',(uname) => {    
        //jos nimi vaihtuu
    })

    socket.on('whoami',(uname) => {    
        if(!users.some( value => value.name == uname )){
            const user = { 
                name:uname,
                socketId:socket.id 
            }
            users.push(user)
            console.log('a user was named ' + uname);
            socket.broadcast.emit("notifyAll",'👋' + uname + " connected");
        }else{
            //console.log("user "+uname+" found users",users)
            users[users.findIndex( value => value.name == uname)].socketId = socket.id; //renew socket id
            console.log(users)
            console.log('user ' + uname + ' reconnected'); 
            socket.broadcast.emit("notifyAll",'🔙' + uname + " reconnected");
        }
    })

    socket.on('iswriting',(uname) => {    
        socket.broadcast.emit("useriswriting",'✍️' + uname + " is typing");
    })
});

/*WATCHFILE toiminnot */
fs.watchFile(fileName,
   
// The options parameter is used to 
//modify the behaviour of the method
{
  // Specify the use of big integers
  // in the Stats object 
  bigint: false,

  // Specify if the process should 
  // continue as long as file is
  // watched
  persistent: true,

  // Specify the interval between
  // each poll the file
  interval: 1000,
},
(curr, prev) => {
    console.log("\nThe file was edited");

    // Show the time when the file was modified
    // console.log("Previous Modified Time", prev.mtime);
    // console.log("Current Modified Time", curr.mtime);

    // console.log(
    //     "The contents of the current file are:",
    //     fs.readFileSync(fileName, "utf8")
    // );
    notifyUser(fs.readFileSync(fileName, "utf8"),true);
}
);

/*SERVER */
server.listen(3000, () => {
    console.log('listening on *:3000');
    console.log("http://localhost:3000");
}); 

setInterval(()=>notifyUser("The chat is still active (alivecode:"+Math.random()+")"),60000)
