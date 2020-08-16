const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const auth_util = require('./auth_util');
const auth = require('./routes/auth');
const usersRouter = require('./routes/users');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);
const temp_path = path.join(__dirname, 'public', 'index.html');
const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', function(req, res) {
  res.sendFile(temp_path);
});
app.get('/register', function(req, res) {
  res.sendFile(temp_path);
});
app.use('/api/v1/login', auth.login);
app.use('/api/v1/register', auth.register);
app.get('/', function(req, res, next) {
  res.sendFile(temp_path);
});
app.get('/dashboard', function(req, res, next) {
  res.sendFile(temp_path);
});

app.use(async function(req, res, next) {
  const bearerToken = (req.headers.authorization || "").split(" ")[1] || "";
  const username = await auth_util.verifyAccesstoken(bearerToken);
  if(username != null) {
    req.username = username;
    next();
  } else {
    return res.sendStatus(401);
  }
});

app.use('/api/v1', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error(err);
  res.status(err.status || 500);
  res.send('error');
});

let activeUsers = {};
io.on('connection', (socket) => {
  socket.on('new user', (data) => {
    if(data in activeUsers) {
      activeUsers[data].count++;
    } else {
      activeUsers[data] = {
        count: 1,
        socket: socket
      };
    }
    socket.userId = data;
    io.emit('new user', Object.keys(activeUsers));
  });

  socket.on('disconnect', () => {
    activeUsers[socket.userId].count--;
    if(activeUsers[socket.userId].count == 0) {
      delete activeUsers[socket.userId];
    }
    io.emit('new user', Object.keys(activeUsers));
  });

  socket.on('start typing', (to) => {
    if(to in activeUsers) {
      activeUsers[to].socket.emit('start typing', socket.userId);
    }
  });

  socket.on('stop typing', (to) => {
    if(to in activeUsers) {
      activeUsers[to].socket.emit('stop typing', socket.userId);
    }
  });
});

server.listen(port);

module.exports.io = io;
