require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const cors = require('cors'); // required to pass tests
const app = express();
app.use(cors({origin: '*'}));  // required to pass tests

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

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
const Collectible = require('./public/Collectible');
const Player = require('./public/Player');

const Dimensions = require('./public/canvas-data')
const canvasCalcs = Dimensions.canvasCalcs

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const io = socket(server)

let currPlayers = [];

function createCollectible(){
  return new Collectible({
    x: randomInteger(canvasCalcs.playFieldMinX, canvasCalcs.playFieldMaxX),
    y: randomInteger(canvasCalcs.playFieldMinY, canvasCalcs.playFieldMaxY),
    value: randomInteger(1, 3), 
    id: Date.now(),
  })
}

let item = createCollectible()



io.on('connection', socket => {
  
  socket.emit('init', {id: socket.id, players: currPlayers, coin: item})

  socket.on('new-player', newplayer => {
    currPlayers.push(new Player(newplayer))
    io.emit('new-player', newplayer)
  })

  socket.on('move-player', (dir, {x, y}) => {
    const movingPlayer = currPlayers.find(obj => obj.id === socket.id);
    movingPlayer.moveDir(dir);
    movingPlayer.x = x;
    movingPlayer.y = y;

    


    io.emit('move-player', ({id: socket.id, dir, posObj: {x, y} }))

    if (movingPlayer.collision(item)){
      item = createCollectible()
      io.emit('new-coin', item)
      movingPlayer.score += item.value
      io.emit('update-player', movingPlayer)

    }

  })

  socket.on('stop-player', (dir, {x, y}) => {
    const stoppingPlayer = currPlayers.find(obj => obj.id === socket.id);
    stoppingPlayer.stopDir(dir);
    stoppingPlayer.x = x;
    stoppingPlayer.y = y;
    io.emit('stop-player', ({id: socket.id, dir, posObj: {x, y} }))
  })
  

  socket.on('disconnect', () => {
    currPlayers = currPlayers.filter(x => x.id != socket.id)
    io.emit('remove-player', socket.id)
  })

})


module.exports = app; // For testing
