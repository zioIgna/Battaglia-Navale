const app = require("./backend/app");
const debug = require("debug")("node-angular");
const http = require("http");

const normalizePort = val => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};

const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.Server(app);    //ho cambiato il metodo da "createServer(app)" a Server(app)

// costanti aggiunte per supporto a socket.io:
const io = require("socket.io").listen(server);
// let loggedIds = [];
// let loggedEmails = [];
let loggedUsers = [];
let games = app.games;
let activePlayers = app.players;
// fin qui

server.on("error", onError);
server.on("listening", onListening);
server.listen(port, function () {
    console.log('listening on port ' + port);
}
);

io.on('connection', function (socket) {
    const myId = socket.id; // aggiunto per implementare un collegamento utente-connessione
    console.log("Socket connected: " + myId);   // aggiunto per implementare un collegamento utente-connessione
    console.log("USER CONNECTED...");
    socket.on('logged user', function (datiConnessione){
        // loggedIds.push(myId);
        // loggedEmails.push(datiConnessione.email);
        loggedUsers.push(datiConnessione);
        io.emit('logged user', loggedUsers);
    });
    socket.on('disconnect', function () {
        // loggedUsers.pop(loggedUsers.find(element => element.connectionId === myId));
        loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(myId), 1);
        io.emit('logged user', loggedUsers);
        console.log('user disconnected');
    });
    socket.on('disconnect', function (){    // aggiunto per implementare un collegamento utente-connessione
        console.log("Socket disconnected: " +  myId);   // aggiunto per implementare un collegamento utente-connessione
    });
    socket.on('user loggedOut', function (datiConnessione) {
      // loggedUsers.pop(loggedUsers.find(element => element.connectionId === datiConnessione.connectionId));
      loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(datiConnessione.connectionId), 1);
      console.log('questa è lo id da eliminare a un logOut: ' + loggedUsers.map(function(element) {return element.connectionId}).indexOf(datiConnessione.connectionId));
        io.emit('logged user', loggedUsers);
        console.log('user disconnected (loggedOut)');
    });
    // socket.on('user logged', function (){
    //     console.log("Questo è il mio socket.id: " + myId);
    // });
    socket.on('new user', function (obj) {
        console.log(obj.message);
        io.emit('new user', obj);
    });
    socket.on('deleted user', function (obj){
        console.log(obj.message);
        io.emit('deleted user');
    });
    socket.on('user updated', function (obj){
        console.log(obj.message);
        io.emit('user updated');
    });
    socket.on('new msg', function (obj){
        console.log(obj.message);
        io.emit('new msg');
    });
    socket.on('new game', function(email){
      games.push(email);
      io.emit('new game', games);
    });
    socket.on('start battle', function(players){
      // activePlayers.push(players.nowPlaying);
      activePlayers.push.apply(activePlayers, players.nowPlaying);
      // console.log('nel server, questi sono gli activePlayers: ' + activePlayers);
      const updatedPlayers = {nowPlaying: players.nowPlaying, activePlayers: activePlayers};
      // console.log('nel server, questi sono gli updatedPlayers: ' + JSON.stringify(updatedPlayers));
      io.emit('start battle', updatedPlayers);
    });
    socket.on('new ship', function (coordinates) {
      console.log('è stata posizionata una nave con queste coordinate: ' + JSON.stringify(coordinates));
      io.emit('new ship', coordinates);
    });
    socket.on('navy positioned', function(myBattle){
      io.emit('navy positioned', myBattle);
    });
    socket.on('hit', function (obj) {
      socket.broadcast.emit('hit', obj);
    });
    socket.on('miss', function(obj){
      socket.broadcast.emit('miss', obj);
    });
    socket.on('switch player', function (myBattle) {
      socket.broadcast.emit('switch player', myBattle);
    });
});
