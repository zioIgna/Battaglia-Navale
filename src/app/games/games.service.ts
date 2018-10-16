import { UsersService } from './../users/users.service';
import { Injectable, OnInit } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { Subscription, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GamesService implements OnInit {

    games: string[] = [];  // ['Player1', 'Player2', 'Player3', 'ignaziocarbonaro@hotmail.com'];
    private gamesListener = new Subject<string[]>();
    private alreadyWaitingListener = new Subject<boolean>();
    activePlayers: string[];
    private activePlayersSub: Subscription;
    // private activePlayersListener = new Subject<string[]>();

    constructor(private usersService: UsersService, private connessione: ConnectionService) { }

    getAlreadyWaitingListener() {
      return this.alreadyWaitingListener.asObservable();
    }

    createGame() {
      const myMail = this.usersService.getLoggedEmail();
      if (!this.games.includes(myMail)) {
        // this.games.push(myMail); // meglio fare l'update dell'array quando si riceve il segnale dal server
        this.alreadyWaitingListener.next(true);
        this.connessione.socket.emit('new game', myMail);
      }
    }

    sendGames(newGames) {
      this.games = newGames;
      this.gamesListener.next([...newGames]);
    }

    getGamesListener() {
      return this.gamesListener.asObservable();
    }

    // sendActivePlayers(newActivePlayers) {
    //   this.activePlayers = newActivePlayers;
    //   this.activePlayersListener.next([...newActivePlayers]);
    // }
    ngOnInit() {
      this.activePlayers = this.usersService.activePlayers;
      this.activePlayersSub = this.usersService.getActivePlayersListener()
        .subscribe(newActivePlayers => this.activePlayers = newActivePlayers);
    }

}
