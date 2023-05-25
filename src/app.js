const express = require('express');
const app = express();


// socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000

const loadMap = require("./mapLoader");
const TICK_RATE = 30;
let players = [];
const inputsMap = {}
const SPEED   = 12;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

function tick() {
  for (const player of players) {
    const inputs = inputsMap[player.id];
    if (inputs.up) {
      player.y -= SPEED
    }
    else if (inputs.down) {
      player.y += SPEED
    }
    else if (inputs.left) {
      player.x -= SPEED
    }
    else if (inputs.right) {
      player.x += SPEED
    }
  }

  io.emit("players", players);
}

 

async function main() {

  const {water2D, ground2D, decal2D} = await loadMap();

  io.on("connect", (socket) => {
    console.log("user connect", socket.id);
    
    inputsMap[socket.id] = {
      up:   false,
      down: false,
      left: false,
      right: false
    };

    players.push({      // player id and initial coordinate 
      id: socket.id,
      x : 360,
      y : 240
    })

    socket.emit('map', {
      water : water2D,
      ground : ground2D,
      decal : decal2D,
    });

    socket.on("inputs", (inputs) => {
      inputsMap[socket.id] = inputs;
    });

    socket.on("disconnect", () =>{ // player disconect 
      players = players.filter((player) => player.id !== socket.id)
      console.log("disconnected")
    })
  });
  
  server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
  
  let lastUpdate = Date.now();
  setInterval(() => {           // server tick rate
    const now = Date.now();
    const delta = now - lastUpdate;
    tick(delta);
    lastUpdate = now;
  }, 1000 / TICK_RATE);

  console.log("server is loaded");
}

main();

