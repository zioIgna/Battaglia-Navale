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
let loggedUsers = app.loggedUsers; // contiene oggetti così formati: {email: ..., connectionId: ...}
let games = app.games;
let activePlayers = app.players;    // array di stringhe (emails)
// fin qui

server.on("error", onError);
server.on("listening", onListening);
server.listen(port, function () {
    console.log('listening on port ' + port);
  }
);

io.on('connection', function (socket) {
    const myId = socket.id; // aggiunto per implementare un collegamento utente-connessione
    let myServerBattle;   // per verificare se un utente si è disconnesso durante una battaglia
    console.log("Socket connected: " + myId);   // aggiunto per implementare un collegamento utente-connessione
    console.log("USER CONNECTED...");
    socket.on('logged user', function (datiConnessione){
        // loggedIds.push(myId);
        // loggedEmails.push(datiConnessione.email);
        loggedUsers.push(datiConnessione);
        io.emit('logged user', loggedUsers);
    });
    socket.on('disconnect', function () {
      userDisconnect2();

      // loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(myId), 1);
      //   if (myServerBattle) {  // nel caso in cui un utente si disconnetta DURANTE una partita
      //     // io.emit('disconnectionEndGame', myServerBattle);
      //     let myBattleCopy = [...myServerBattle];
      //     const lunghezza = myBattleCopy.length;
      //     for (let i = 0; i < lunghezza; i++) {
      //       let val = myBattleCopy.pop();
      //       let index = activePlayers.indexOf(val);
      //       if (index > -1) {
      //         activePlayers.splice(index, 1);
      //       };
      //     };
      //     console.log('ora questi sono gli activePlayers: ' + activePlayers);
      //     console.log('e questa è myServerBattle: ' + myServerBattle);
      //     // let index = games.indexOf(myServerBattle[0]);
      //     // games.splice(index, 1); // così elimino dall'elenco dei games il nome del "propositore" della partita terminata
      //     console.log('ora questi sono i games: ' + games);
      //     const updatedPlayers = { myBattle: myServerBattle, activePlayers: activePlayers, games: games, playerDisconnected: true};
      //     io.emit('endGame', updatedPlayers);
      //   };
      //   // myServerBattle = undefined;
      //   io.emit('logged user', loggedUsers);

        console.log('user disconnected');
    });
    socket.on('disconnect', function (){    // aggiunto per implementare un collegamento utente-connessione
        console.log("Socket disconnected: " +  myId);   // aggiunto per implementare un collegamento utente-connessione
    });
    socket.on('user loggedOut', function (datiConnessione) {
      userDisconnect2();

      // loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(datiConnessione.connectionId), 1);
      // console.log('questa è lo id da eliminare a un logOut: ' + loggedUsers.map(function(element) {return element.connectionId}).indexOf(datiConnessione.connectionId));
      // io.emit('logged user', loggedUsers);

      console.log('user disconnected (loggedOut)');
    });
    // socket.on('user logged', function (){
    //     console.log("Questo è il mio socket.id: " + myId);
    // });
    socket.on('confirm abandoned battle', function (myBattle) {
      console.log('myBattle === myServerBattle: ' + JSON.stringify(myBattle) === JSON.stringify(myServerBattle));
      if(JSON.stringify(myBattle) === JSON.stringify(myServerBattle)) {
        myServerBattle = undefined;
      };
      userDisconnect(myBattle);
    });
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
      myServerBattle = players.nowPlaying;
      console.log('ora questa è myServerBattle: ' + myServerBattle);
      // console.log('nel server, questi sono gli activePlayers: ' + activePlayers);
      const newCurrPlayer = Math.floor(Math.random() * 2);
      const updatedPlayers = {nowPlaying: players.nowPlaying, activePlayers: activePlayers, currPlayer: newCurrPlayer};
      // console.log('nel server, questi sono gli updatedPlayers: ' + JSON.stringify(updatedPlayers));
      io.emit('start battle', updatedPlayers);
    });
    socket.on('push myServerBattle', function(myBattle){  // forse questo non serve: già fatto in 'start battle' (?)
      myServerBattle = myBattle;
      console.log('ho appena pushato ' + myBattle + ' in myServerBattle: ' + myServerBattle);
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
    socket.on('endGame', function (myBattle) {
      let myBattleCopy = [...myBattle];
      console.log('myBattle === myServerBattle: ' + JSON.stringify(myBattle) === JSON.stringify(myServerBattle));
      if(JSON.stringify(myBattle) === JSON.stringify(myServerBattle)) {
        myServerBattle = undefined;
      }
      const lunghezza = myBattleCopy.length;
      for (let i = 0; i < lunghezza; i++) {
        let val = myBattleCopy.pop();
        let index = activePlayers.indexOf(val);
        if (index > -1) {
          activePlayers.splice(index, 1);
        };
      };
      console.log('ora questi sono gli activePlayers: ' + activePlayers);
      let index = games.indexOf(myBattle[0]);
      games.splice(index, 1); // così elimino dall'elenco dei games il nome del "propositore" della partita terminata
      console.log('ora questi sono i games: ' + games);
      const updatedPlayers = { myBattle: myBattle, activePlayers: activePlayers, games: games};
      io.emit('endGame', updatedPlayers);
    });
    socket.on('switch player', function (myBattle) {
      socket.broadcast.emit('switch player', myBattle);
    });


    function userDisconnect(battle){
      console.log('fighterDisconnect triggered');
      // loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(myId), 1);
        // io.emit('disconnectionEndGame', myServerBattle);
      let myBattleCopy = [...battle];
      const lunghezza = myBattleCopy.length;
      for (let i = 0; i < lunghezza; i++) {
        let val = myBattleCopy.pop();
        let index = activePlayers.indexOf(val);
        if (index > -1) {
          activePlayers.splice(index, 1);
        };
      };
      console.log('ora questi sono gli activePlayers: ' + activePlayers);
      // console.log('e questa è myServerBattle: ' + myServerBattle);
      // let index = games.indexOf(myServerBattle[0]);
      // games.splice(index, 1); // così elimino dall'elenco dei games il nome del "propositore" della partita terminata
      console.log('ora questi sono i games: ' + games);
      const updatedPlayers = { myBattle: battle, activePlayers: activePlayers, games: games, playerDisconnected: true};
      io.emit('endGame', updatedPlayers);
      console.log('ora myServerBattle = ' + myServerBattle);
      myServerBattle = undefined;
      console.log('ora myServerBattle = ' + myServerBattle);
      io.emit('logged user', loggedUsers);
    };

    function userDisconnect2(){  // elimino da loggedUsers l'utente e verifico se stava giocando una partita
      let mySelf = loggedUsers.find(obj => obj.connectionId == myId);
      loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(myId), 1);
      // se utente stava giocando una partita (non terminata) avviso tutti gli utenti per rintracciare l'altro
      // giocatore della stessa partita: sarà lui a far partire la comunicazione che una partita è stata interrotta
      // e indicherà quali utenti eliminare dagli active players
      if(activePlayers.includes(mySelf.email)){
        console.log('Chi ha abbandonato stava giocando');
        io.emit('abandoned battle', mySelf.email);
      }
    }

    function userDisconnect3(){   // non usata
      console.log('fighterDisconnect triggered');
      // loggedUsers.splice(loggedUsers.map(function(element) {return element.connectionId}).indexOf(myId), 1);
      if (myServerBattle) {  // nel caso in cui un utente si disconnetta DURANTE una partita
        // io.emit('disconnectionEndGame', myServerBattle);
        let myBattleCopy = [...myServerBattle];
        const lunghezza = myBattleCopy.length;
        for (let i = 0; i < lunghezza; i++) {
          let val = myBattleCopy.pop();
          let index = activePlayers.indexOf(val);
          if (index > -1) {
            activePlayers.splice(index, 1);
          };
        };
        console.log('ora questi sono gli activePlayers: ' + activePlayers);
        console.log('e questa è myServerBattle: ' + myServerBattle);
        // let index = games.indexOf(myServerBattle[0]);
        // games.splice(index, 1); // così elimino dall'elenco dei games il nome del "propositore" della partita terminata
        console.log('ora questi sono i games: ' + games);
        const updatedPlayers = { myBattle: myServerBattle, activePlayers: activePlayers, games: games, playerDisconnected: true};
        io.emit('endGame', updatedPlayers);
        console.log('ora myServerBattle = ' + myServerBattle);
        myServerBattle = undefined;
        console.log('ora myServerBattle = ' + myServerBattle);
      };
      io.emit('logged user', loggedUsers);
    };

});
