import { ConnectionService } from './../../connection.service';
import { UsersService } from 'src/app/users/users.service';
import { GamesService } from './../games.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GamesComponent } from '../games.component';
import { BattleComponent } from '../battle/battle.component';
import { BattleService } from '../battle/battle.service';


@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit, OnDestroy {
  games: string[]; // ['Player1', 'Player2', 'Player3', 'ignaziocarbonaro@hotmail.com'];
  gamesSub: Subscription;
  loggedUserEmail: string;
  private loggedEmailSub: Subscription;
  activePlayers: string[] = [];
  private activePlayersSub: Subscription;

  // aggiunto da qui
  private connectionId: string;
  // private connectionIdSub: Subscription;
  // a qui

  constructor(
    private gamesService: GamesService,
    private usersService: UsersService,
    private connectionService: ConnectionService,
    private router: Router,
    private battleService: BattleService
  ) { }

  ngOnInit() {
    this.loggedUserEmail = this.usersService.getLoggedEmail();
    console.log('Il loggedUserEmail è: ' + this.loggedUserEmail);
    this.loggedEmailSub = this.usersService.getLoggedEmailListener().subscribe(loggedUser => {
      this.loggedUserEmail = loggedUser;
      console.log('Il loggedUserEmail è: ' + this.loggedUserEmail);
    });
    // this.connectionId = this.connectionService.socket.id;
    this.connectionId = this.usersService.getConnectionId();
    console.log('Nella game-list lo id connessione è: ' + this.connectionId);
    // this.connectionIdSub = this.connectionService.getId().subscribe(id => {
    //   this.connectionId = id;
    //   console.log('Nella game-list lo id connessione è: ' + this.connectionId);
    // });
    this.games = this.gamesService.games;
    this.gamesSub = this.gamesService.getGamesListener().subscribe(newGames => this.games = newGames);
    this.activePlayers = this.usersService.activePlayers;
    this.activePlayersSub = this.usersService.getActivePlayersListener()
      .subscribe(newActivePlayers => this.activePlayers = newActivePlayers);
  }

  onStartBattle(game: string) {
    this.battleService.startBattle(game);
    console.log('Questo è il parametro game passato: ' + game);
    // this.battleService.createBoards();
    // this.router.navigate(['/battle']);
  }

  ngOnDestroy() {
    this.gamesSub.unsubscribe();
    this.loggedEmailSub.unsubscribe();
    this.activePlayersSub.unsubscribe();
  }
}
