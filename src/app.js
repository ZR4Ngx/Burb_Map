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
const TILE_SIZE = 12;
let players = [];
const inputsMap = {}
const SPEED   = 12;

let water2D, decal2D;


function isColliding(rect1, rect2) { // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  return (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y
  );
}

function isCollidingWithMap(player) {
  
  for (let row = 0; row < decal2D.length; row++) {
    for (let col = 0; col < decal2D[0].length; col++) {
      const tile = decal2D[row][col];
      

      if (
        tile &&
        isColliding(
          {
            x: player.x,
            y: player.y,
            w: 12,
            h: 12,
          },
          {
            x: col * TILE_SIZE,
            y: row * TILE_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE,
          }
        )
      ) {
        return true;
      }
    }
  }
  // return false;
}



app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

function tick(delta) {
  for (const player of players) {
    const inputs = inputsMap[player.id];
    const previousY = player.y;
    const previousX = player.x;

    if (inputs.up) {
      player.y -= SPEED
    } else if (inputs.down) {
      player.y += SPEED
    }

    if (isCollidingWithMap(player)) {
      player.y = previousY;
    }

    if (inputs.left) {
      player.x -= SPEED
    }else if (inputs.right) {
      player.x += SPEED
    }

    if (isCollidingWithMap(player)) {
      player.x = previousX;
    }
    
  }

  io.emit("players", players);
}



async function main() {

  ({water2D, ground2D, decal2D} = await loadMap());

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

