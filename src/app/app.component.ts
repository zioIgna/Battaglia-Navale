import { Component, OnInit } from '@angular/core';
import { ConnectionService } from './connection.service';
import { UsersService } from './users/users.service';
import { MessagesService } from './messages/messages.service';
import { Subscription } from '../../node_modules/rxjs';
import { GamesService } from './games/games.service';
import { BattleService } from './games/battle/battle.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private loggedEmail: string;
    private loggedEmailListener: Subscription;

    constructor(
        private connessione: ConnectionService,
        private usersService: UsersService,
        private msgService: MessagesService,
        private gamesService: GamesService,
        private battleService: BattleService
    ) { }

    ngOnInit() {
        // if (this.connessione.socket == null) {
        //   this.connessione.socket = this.connessione.getConnection();
        // }
        this.connessione.getConnection();
        console.log(this.connessione.socket);
        // socket.on('connection', () => {
        //   console.log('user connected');
        // });

        // prova: commento questa funzione per provare una alternativa all'evento "new user"
        // this.connessione.socket.on('new user', (obj) => {
        //   this.usersService.users.push(obj.payload);
        //   this.usersService.usersUpdated.next([...this.usersService.users]);
        //   // this.usersService.createUserNoPropagate(obj.payload.email, obj.payload.password);  // questa linea non serve
        //   console.log(obj);
        // });

        this.loggedEmail = this.usersService.getLoggedEmail();
        this.loggedEmailListener = this.usersService.getLoggedEmailListener().subscribe(loggedMail => {
            this.loggedEmail = loggedMail;
        });

        this.connessione.socket.on('new user', (obj) => {
            this.usersService.getUsers();
        });

        this.connessione.socket.on('deleted user', () => {
            this.usersService.getUsers();
        });

        this.connessione.socket.on('user updated', () => {
            this.usersService.getUsers();
        });

        this.connessione.socket.on('new msg', () => {
            this.msgService.getMessages(this.loggedEmail);
        });

        this.connessione.socket.on('logged user', (users) => {
          this.usersService.loggedEmails = users.map(user => user.email);
          console.log('questi sono i loggedEmails adesso: ' + this.usersService.loggedEmails);
        });

        this.connessione.socket.on('new game', (newGames) => {
          // this.gamesService.sendGames(newGames);
          this.usersService.games = newGames;
          this.usersService.sendGames(newGames);
        });

        this.connessione.socket.on('start battle', (players) => {
          this.usersService.activePlayers = players.activePlayers;
          // non invio la copia dell'oggetto perché contiene un array (che non verrebbe "duplicato"):
          this.usersService.sendActivePlayers(players.activePlayers);
          console.log('allo start battle, questi sono i Players: ' + JSON.stringify(players));
          console.log('allo start battle, questi sono gli activePlayers: ' + players.activePlayers);
          if (players.nowPlaying.includes(this.loggedEmail)) {
            this.battleService.createBoards(players);
          }
        });
    }


}
