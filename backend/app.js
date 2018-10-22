const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/user');
const Message = require('./models/message');
const checkAuth = require('./middleware/check-auth');

const app = express();

let activePlayers = [];
let games = [];

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
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
})

app.post('/api/messages', (req, res, next) => {
    const richiesta = req.body;
    console.log(richiesta);
    const message = new Message({
        autore: req.body.autore,
        contenuto: req.body.contenuto,
        destinatario: req.body.destinatario,
        timestamp: req.body.timestamp
    });
    message.save()
        .then((savedData) => {
            res.status(200).json({ note: 'Messaggio salvato con successo', msg: savedData });
        })
        .catch((err) => {
            res.status(400).json({ note: 'Errore nel salvataggio del messaggio', msg: err });
        });
    // res.status(201).json({
    //     note: 'Messaggio aggiunto con successo'
    // });
});

app.get('/api/messages/:email', (req, res, next) => {
    // const messages = [
    //     { id: 'pqwe0rjfa3', autore: 'autore 1', contenuto: 'primo messaggio', destinatario: 'autore 2', timestamp: '2018-07-08T20:34:44.117Z' },
    //     { id: 'weorrs3gu', autore: 'autore 2', contenuto: 'secondo messaggio', destinatario: 'autore 1', timestamp: '2018-07-08T20:35:26.866Z' },
    //     { id: 'aèdfq0392', autore: 'autore 3', contenuto: 'terzo messaggio', destinatario: 'autore 2', timestamp: '2018-07-08T20:35:54.601Z' }
    // ];
    console.log('questi sono i parametri email del get messages: ', req.params);
    // { $or: [{ autore: { $eq: req.params.email } }, { destinatario: { $eq: req.params.email } }] }
    Message.find({ $or: [{ autore: { $eq: req.params.email } }, { destinatario: { $eq: req.params.email } }] }, null, { sort: { timeStamp: -1 } })
        .then(response => {
            res.status(200).json({
                note: 'Messages fetched successfully!',
                messages: response
            });
        })
        .catch(err => {
            res.status(400).json({
                note: 'Error fetching messages ' + err
            });
        });
});

// metodi per gestione di utenti (aggiunti per progetto)
app.get('/api/users', checkAuth, (req, res, next) => {
    // const users = [
    //     { email: 'primo@prova.it', password: '1234', ruolo: 'basic' },
    //     { email: 'secondo@prova.it', password: '1234', ruolo: 'basic' },
    //     { email: 'terzo@prova.it', password: '1234', ruolo: 'basic' }
    // ];
    User.find({}, null, { sort: { score: -1 } }).then((docs) => {
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
    console.log('req.body del signup: ', req.body);
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

                {
                    const token = jwt.sign(
                        { email: savedData.email, userId: savedData._id, role: savedData.role },
                        'password_segreta_per_la_cifratura',
                        { expiresIn: '1h' }
                    );

                    res.status(201).json({
                        note: 'Risposta dal backend: User added!',
                        datiSalvati: savedData,
                        token: token
                    });


                }
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
                token: token,
                expiresIn: 3600,
                userRole: fetchedUser.role,
                userId: fetchedUser._id,
                email: fetchedUser.email,
                activePlayers: activePlayers,
                games: games
            });
        })
        .catch(err => {
            return res.status(401).json({
                message: 'Authentication failed!'
            });
        });
});

app.put('/api/users/switch/:id', (req, res, next) => {
    console.log('sono arrivato all\'indirizzo dello switch');
    console.log('questo è il req.body: ', req.body);
    const newRole = req.body.role;
    console.log('questo è il ruolo che si imposta: ', newRole);

    User.updateOne({ _id: req.params.id }, { $set: { role: newRole } }, (err, raw) => {
        if (err) {
            return res.status(400).json({ message: 'User update failed', esito: err });
        }
        console.log('Msg da backend: Update riuscito');
        return res.status(200).json({ message: 'Update successful', esito: raw });
    }).then(result => {
        console.log('risultato dello update: ', result);
    }).catch(err => {
        console.log('problemi nello update user: ', err);
    });

    // User.updateOne({ _id: req.params.id, role: { $eq: 'basic' } }, { $set: { role: 'admin' } }, (err, raw) => {
    //     if (err) {
    //         res.status(400).json({ message: 'User update failed', errore: err });
    //     }
    //     else {
    //         if (raw.n === 0) {
    //             console.log('questo è il raw: ', raw);
    //             User.updateOne({ _id: req.params.id, role: { $eq: 'admin' } }, { $set: { role: 'basic' } }, (err, raw) => {
    //                 if (err) {
    //                     return res.status(400).json({ message: 'Secondo tentativo di update fallito', errore: err });
    //                 }
    //                 console.log('Update riuscito al secondo tentativo');
    //                 return res.status(200).json({ message: 'Msg from backend: Update successful', raw });
    //             })
    //         }
    //         console.log('Update riuscito al primo tentativo');
    //         return res.status(200).json({ message: 'Msg from backend: Update successful', raw });
    //     }
    // })


    // .catch(err => {
    //     console.log(err);
    //     return res.status(400).json({ message: 'problemi con funzione edit' });
    // })
})

app.put('/api/users/upgrade/:id', (req, res, next) => {});

app.delete('/api/users/delete/:id', (req, res, next) => {
    User.deleteOne({ _id: req.params.id }).then(result => {
        console.log(result);
        res.status(200).json({ message: 'User deleted!' });
    })
});


module.exports = app;
module.exports.players = activePlayers;
module.exports.games = games;
