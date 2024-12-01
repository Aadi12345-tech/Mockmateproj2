// server.js

const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let canvasState = [];  // Store the drawing data

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  // Send the initial canvas state to the new user
  ws.send(JSON.stringify({ type: 'INIT', data: canvasState }));

  // Broadcast drawing updates to all clients
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'DRAW') {
      // Save the drawing action to canvasState and broadcast to others
      canvasState.push(msg.data);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    // Optionally, you can implement user presence logic here
  });
});

app.use(express.static('public'));  // Serve the frontend from the 'public' directory

// Start the server
server.listen(5000, () => {
  console.log('Server is running on ws://localhost:5000');
});
