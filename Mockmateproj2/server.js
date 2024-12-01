const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let canvasState = []; 


wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'INIT', data: canvasState }));

  
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'DRAW') {
      
      canvasState.push(msg.data);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });

app.use(express.static('public'));


server.listen(5000, () => {
  console.log('Server is running on ws://localhost:5000');
});
