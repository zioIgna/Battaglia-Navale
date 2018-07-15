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
// var ios = undefined;

// costanti aggiunte per supporto a socket.io:
// ios = io(server);
// io.on('connection', function (client) {
//     console.log("Socket.io client connected");
// });

// io.sockets.on('connection', function (socket) {
//     console.log("USER CONNECTED...");
// });


// fin qui

server.on("error", onError);
server.on("listening", onListening);
server.listen(port
    , function () {
        console.log('listening on port ' + port);


    }
);

io.on('connection', function (socket) {
    console.log("USER CONNECTED...");
});