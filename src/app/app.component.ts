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
    private loggedEmails: string[];
    private loggedEmailsListener: Subscription;

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

        this.loggedEmails = this.usersService.loggedEmails;
        this.loggedEmailsListener = this.usersService.getLoggedEmailsPluralListener().subscribe(newEmails => {
          this.loggedEmails = newEmails;
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
          this.usersService.sendLoggedEmailsPluralListener(this.usersService.loggedEmails);
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
            this.battleService.playerDisconnected = false;
            this.battleService.sendPlayerDisconnectedListener(false);
            this.battleService.endGame = false;
            this.battleService.sendEndGameListener(false);
            this.battleService.currPlayer = players.currPlayer; // aggiungere sottoscrizione!!! -> forse non serve
            // forse questo non serve: già fatto in 'start battle' (?):
            this.connessione.socket.emit('push myServerBattle', players.nowPlaying);
            //
            this.battleService.createBoards(players);
          }
        });

        this.connessione.socket.on('new ship', (coordinates) => {
          console.log('queste sono le coordinates passate dal server: ' + JSON.stringify(coordinates));
          console.log('myBattle.includes(this.usersService.getLoggedEmail): '
            + coordinates.myBattle.includes(this.usersService.getLoggedEmail));
          console.log('typeof coordinates.myBattle: ' + typeof(coordinates.myBattle));
          const myMail = this.usersService.getLoggedEmail();
          if (coordinates.myBattle.includes(myMail)) {
            console.log('riconosciuta la partita!');
            this.battleService.addShip(coordinates.boardId, coordinates.row, coordinates.col,
              coordinates.shipId, coordinates.size, coordinates.orientation);
          }
        });

        this.connessione.socket.on('navy positioned', (myBattle) => {
          const myMail = this.usersService.getLoggedEmail();
          if (myBattle.includes(myMail)) {
            this.battleService.positionedShips++;
            this.battleService.sendPositionedShipsListener(this.battleService.positionedShips);
            console.log('Posizionate ' + this.battleService.positionedShips + ' flotte');
          }
        });

        this.connessione.socket.on('hit', (obj) => {
          const myMail = this.usersService.getLoggedEmail();
          if (obj.myBattle.includes(myMail)) {
            this.battleService.getBoards()[obj.ship.boardId].tiles[obj.ship.row][obj.ship.col].value = 'X';
          }
        });

        this.connessione.socket.on('miss', (obj) => {
          const myMail = this.usersService.getLoggedEmail();
          if (obj.myBattle.includes(myMail)) {
            this.battleService.getBoards()[obj.ship.boardId].tiles[obj.ship.row][obj.ship.col].value = 'M';
          }
        });

        this.connessione.socket.on('switch player', (myBattle) => {
          const myMail = this.usersService.getLoggedEmail();
          if (myBattle.includes(myMail)) {
            this.battleService.currPlayer = (this.battleService.currPlayer + 1) % this.battleService.playersNumber;
            this.battleService.sendCurrPlayerListener(this.battleService.currPlayer);
            console.log('l\' attuale giocatore è: ' + this.battleService.currPlayer);
          }
        });

        this.connessione.socket.on('endGame', (updatedPlayers) => {
          const myMail = this.usersService.getLoggedEmail();
          if (updatedPlayers.myBattle.includes(myMail)) {
            this.battleService.endGame = true;
            // this.loggedPlayers = 0;
            this.battleService.hits = 0;
            this.battleService.hitsToWin = 0;
            this.battleService.setBoards([]);
            this.battleService.positionedShips = 0;
            this.battleService.sendEndGameListener(true);
            this.battleService.myBattle = []; // è giusto "azzerare" questo valore?
            if (updatedPlayers.playerDisconnected) {
              this.battleService.playerDisconnected = updatedPlayers.playerDisconnected;
              this.battleService.sendPlayerDisconnectedListener(updatedPlayers.playerDisconnected);
            }
          }
          this.usersService.activePlayers = updatedPlayers.activePlayers;
          this.usersService.sendActivePlayers(updatedPlayers.activePlayers);
          this.usersService.games = updatedPlayers.games;
          this.usersService.sendGames(updatedPlayers.games);
          // non aggiungere un reindirizzamento (né il punto al vincitore perché viene dato direttamente nel metodo getPosition
        });

        this.connessione.socket.on('disconnectionEndGame', (disconnectedEmail) => { // non utilizzata
          const myMail = this.usersService.getLoggedEmail();
          if (myMail === disconnectedEmail) {
            this.connessione.socket.emit('endGame', [disconnectedEmail]);
          }
        });
    }


}
