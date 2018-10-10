import { UsersService } from './../users/users.service';
import { Injectable } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { Subscription, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GamesService {

    games: string[] = ['Player1', 'Player2', 'Player3', 'ignaziocarbonaro@hotmail.com'];

    constructor(private usersService: UsersService, private connessione: ConnectionService) { }

    onCreateGame() {
        const myMail = this.usersService.getLoggedEmail();
        if (!this.games.includes(myMail)) {
            // this.games.push(myMail); // meglio fare l'update dell'array quando si riceve il segnale dal server
            this.connessione.socket.emit('new game', myMail);
        }
    }

    getGames() {

    }

}
