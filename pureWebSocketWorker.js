const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
const fileName = './chat.txt'; // "the database"

const writeToFile = async (nick,content,fileName) => {
    //let response = {nick: ": " + content}
    await fs.appendFile(fileName, nick + ": " + content + "\n", err => {
        if (err) {
            response = [{msg:"Error writing:" + content}]
            console.error(err);
        }
        // file written successfully
        console.log("[WORKER] Wrote:" + content)    
         
    });
    //return response;
}

app.get('/', (req, res) => {

    app.set('view engine', 'pug');
    console.log("Requesting main view ... ");
    res.render('pureWebSocket', { 
      title: 'Websocket Chat', 
      topMsg:"Realtime Chat by GetSOME"
    });
});

const safetifier = (str) => {return str.replace(/[^a-zA-Z0-9 ]/g, "*")}

app.get("/write", async (req, res) => {
    //hx-swap="beforeend" for appending
    console.log("/write");

    const content = safetifier(req.query.message)
    const nick = safetifier(req.query.uname)

    if(content!=""){
        const data = await writeToFile(nick,content,fileName);
    }
    
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("");
    res.end();
});

module.exports = {app,server,fs,fileName} 