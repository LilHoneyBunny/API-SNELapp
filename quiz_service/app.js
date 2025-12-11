const dotenv = require('dotenv');
dotenv.config();
const Server = require('./service/server');
const mainServer = new Server();
mainServer.listen();
