const server = require('http').Server();
const io = require('socket.io')(server);
const port = require('./config').SERVER_PORT;

require('./backend/connect')(io);

io.on('connection', socket => {
  socket.on('register', user => {
    console.info(`User registered: ${user.name}`);
  });
});

server.listen(port, () => {
  console.log(`Server runing at port ${port}`);
});
