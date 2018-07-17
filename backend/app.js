const express = require('express');
const bodyParser = require('body-parser');

const User = require('./models/user');

const app = express();

const users = [
    { email: 'primo@prova.it', password: '1234', ruolo: 'basic' },
    { email: 'secondo@prova.it', password: '1234', ruolo: 'basic' },
    { email: 'terzo@prova.it', password: '1234', ruolo: 'basic' }
];

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})

app.post('/api/messages', (req, res, next) => {
    const message = req.body;
    console.log(message);
    res.status(201).json({
        note: 'Messaggio aggiunto con successo'
    });
});

app.use('/api/messages', (req, res, next) => {
    const messages = [
        { id: 'pqwe0rjfa3', autore: 'autore 1', contenuto: 'primo messaggio', destinatario: 'autore 2', timestamp: '2018-07-08T20:34:44.117Z' },
        { id: 'weorrs3gu', autore: 'autore 2', contenuto: 'secondo messaggio', destinatario: 'autore 1', timestamp: '2018-07-08T20:35:26.866Z' },
        { id: 'aèdfq0392', autore: 'autore 3', contenuto: 'terzo messaggio', destinatario: 'autore 2', timestamp: '2018-07-08T20:35:54.601Z' }
    ];
    res.status(200).json({
        note: 'Messages fetched successfully!',
        messages: messages
    });
});

// metodi per gestione di utenti (aggiunti per progetto)
app.get('/api/users', (req, res, next) => {
    // const users = [
    //     { email: 'primo@prova.it', password: '1234', ruolo: 'basic' },
    //     { email: 'secondo@prova.it', password: '1234', ruolo: 'basic' },
    //     { email: 'terzo@prova.it', password: '1234', ruolo: 'basic' }
    // ];
    res.status(200).json({
        note: 'Users fetched successfully!',
        users: users
    });
});

app.post('/api/users', (req, res, next) => {
    // const user = req.body;
    const user = new User({
        email: req.body.email,
        password: req.body.password,
    });
    users.push(user);
    console.log(user);
    res.status(201).json({
        note: 'Risposta dal backend: User added!'
    });
});

module.exports = app;