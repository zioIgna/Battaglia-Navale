const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/user');
const checkAuth = require('./middleware/check-auth');

const app = express();

mongoose.connect('mongodb+srv://igna:PozKas6M2IC1JgR7@cluster0-3typv.mongodb.net/chat')
    .then(() => {
        console.log('Connected to database!');
    })
    .catch(() => {
        console.log('Connection failed!');
    });

// const users = [
//     { email: 'primo@prova.it', password: '1234', ruolo: 'basic' },
//     { email: 'secondo@prova.it', password: '1234', ruolo: 'basic' },
//     { email: 'terzo@prova.it', password: '1234', ruolo: 'basic' }
// ];

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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
app.get('/api/users', checkAuth, (req, res, next) => {
    // const users = [
    //     { email: 'primo@prova.it', password: '1234', ruolo: 'basic' },
    //     { email: 'secondo@prova.it', password: '1234', ruolo: 'basic' },
    //     { email: 'terzo@prova.it', password: '1234', ruolo: 'basic' }
    // ];
    User.find().then((docs) => {
        // console.log(docs);
        res.status(200).json({
            note: 'Users fetched successfully!',
            users: docs
        });
    });
    // res.status(200).json({
    //     note: 'Users fetched successfully!',
    //     users: users
    // });
});

app.post('/api/users/signup', (req, res, next) => {
    // const user = req.body;
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash,
                role: 'basic',
                score: 0
            });
            user.save()
                .then((savedData) =>
                    // users.push(user);
                    // console.log(user);
                    res.status(201).json({
                        note: 'Risposta dal backend: User added!',
                        datiSalvati: savedData
                    })
                ).catch((err) => {
                    res.status(500).json({
                        error: err
                    });
                });
        });
});

app.post('/api/users/login', (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: 'Authentication failed!'
            });
        }
        fetchedUser = user;
        // console.log('questo è il fetchedUser: ', fetchedUser);
        // console.log(bcrypt.compare(req.body.password, user.password));
        return bcrypt.compare(req.body.password, user.password);
    })
        .then(result => {
            console.log('risultato bcrypt da login: ', result);
            if (!result) {
                return res.status(401).json({
                    message: 'Authentication failed!'
                });
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id, role: fetchedUser.role },
                'password_segreta_per_la_cifratura',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                token: token
            });
        })
        .catch(err => {
            return res.status(401).json({
                message: 'Authentication failed!'
            });
        });
});

module.exports = app;