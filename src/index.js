const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const morgan = require('morgan');
const chalk = require('chalk');

// Initializations
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

// Sockets
require('./sockets')(io);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), () => {
    console.log(chalk.blueBright('Server on port:'), app.get('port'));
});