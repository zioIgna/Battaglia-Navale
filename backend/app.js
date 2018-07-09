const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Message = require('./models/message');

const app = express();

mongoose.connect('mongodb+srv://igna:PozKas6M2IC1JgR7@cluster0-3typv.mongodb.net/chat?retryWrites=true', { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to database!')
    })
    .catch(() => {
        console.log('Connection failed!')
    });

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})

app.post('/api/messages', (req, res, next) => {
    const message = new Message({
        autore: req.body.autore,
        contenuto: req.body.contenuto,
        destinatario: req.body.destinatario
    });
    // console.log(message);
    message.save();
    res.status(201).json({
        note: 'Messaggio aggiunto con successo'
    });
});

app.get('/api/messages', (req, res, next) => {
    // const messages = [
    //     { id: 'pqwe0rjfa3', autore: 'autore 1', contenuto: 'primo messaggio', destinatario: 'autore 2', timestamp: '2018-07-08T20:34:44.117Z' },
    //     { id: 'weorrs3gu', autore: 'autore 2', contenuto: 'secondo messaggio', destinatario: 'autore 1', timestamp: '2018-07-08T20:35:26.866Z' },
    //     { id: 'aèdfq0392', autore: 'autore 3', contenuto: 'terzo messaggio', destinatario: 'autore 2', timestamp: '2018-07-08T20:35:54.601Z' }
    // ];

    Message.find().then((documents) => {
        res.status(200).json({
            note: 'Messages fetched successfully!',
            messages: documents
        });
    });
});

module.exports = app;