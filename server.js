require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const cors = require('cors'); // required to pass tests
const app = express();
app.use(cors({origin: '*'}));  // required to pass tests

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const Player = require('./public/Player.mjs');
const Collectible = require('./public/Collectible');
const {dimension} = require('./public/dimension');

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const getRandomPosition = () => {
  let x = random(dimension.minX+50, dimension.maxX-50)
  let y = random(dimension.minY+50, dimension.maxY-50);
  return [x, y]
}

let playerList = []
let [collectX, collectY] = getRandomPosition()
let collect = new Collectible({x: collectX, y: collectY, value: 1, id: Date.now()})
let connections = [];



const io = socket(server)
io.sockets.on('connection', socket => {
  console.log(`New connection: ${socket.id}`)
  // connections.push(socket)

  let [x, y] = getRandomPosition()
  let player = new Player({x, y, score: 0, id: socket.id})
  playerList.push(player)

  console.log(`TOTAL connections: ${playerList.length}`)

  socket.emit('init', {id: socket.id, players: playerList, collect})

  socket.on('player', (updatedUser) => {
    // console.log('old', playerList)
    playerList.forEach(user => {
        if(user.id == socket.id){
            user.x = updatedUser.x;
            user.y = updatedUser.y;
            user.score = updatedUser.score;
        }
    });
    // console.log('new', playerList)
    io.emit('update', {players: playerList,collect:collect, changed: null});
  });



  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`)
    playerList = playerList.filter(x => x.id != socket.id)
    console.log(`TOTAL connections: ${playerList.length}`)
  })
})




setInterval(tick, 100)
function tick() {
  let updated = null
  playerList.forEach(ppp => {
    let p = new Player(ppp)
    if (p.collision(collect)) {
      ppp.score += 2
      ppp.radius += 10
      let [collectX, collectY] = getRandomPosition();
      collect = new Collectible({x: collectX, y: collectY, value: 1, id: Date.now()})
      updated = ppp
    }
  })
  
  io.emit('udpate', {
    players: playerList,
    collect: collect, 
    changed: updated
  })

  

  
  
}

module.exports = app; // For testing
