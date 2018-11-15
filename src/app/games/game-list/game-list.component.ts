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
  activePlayers: string[] = [];
  private activePlayersSub: Subscription;
  games: string[]; // ['Player1', 'Player2', 'Player3', 'ignaziocarbonaro@hotmail.com'];
  gamesSub: Subscription;
  loggedUserEmail: string;
  private loggedEmailSub: Subscription;
  loggedEmails: string[];
  private loggedEmailsSub: Subscription;
  private playableGames: string[];
  playableGamesSub: Subscription;

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
    this.activePlayers = this.usersService.activePlayers;
    this.activePlayersSub = this.usersService.getActivePlayersListener()
      .subscribe(newActivePlayers => {
        this.activePlayers = newActivePlayers;
        this.updatePlayableGames();
      });  // forse non serve la subscr
    this.loggedEmails = this.usersService.loggedEmails;
    this.loggedEmailsSub = this.usersService.getLoggedEmailsPluralListener().subscribe(newEmails => {
      this.loggedEmails = newEmails
      this.updatePlayableGames();
    });
    this.games = this.usersService.games;
    this.gamesSub = this.usersService.getGamesListener().subscribe(newGames => {
      this.games = newGames;
      this.updatePlayableGames();
    });  // forse questa subscription serve solo per updatePlayableGames
    // this.playableGames = this.usersService.games.filter(element => {
    //   return (element !== this.loggedUserEmail) && this.loggedEmails.includes(element);
    // });
    this.updatePlayableGames();
    // this.playableGames = this.usersService.games.filter(element => {
    // element !== this.loggedUserEmail
    // && (!this.activePlayers || this.activePlayers.length <1 || !this.activePlayers.includes(element))
    // && this.loggedEmails
    // && this.loggedEmails.includes(element)
    // });
    // this.playableGames = this.games;
    console.log('questi sono i playable games: ' + this.playableGames);
    // this.playableGamesSub = this.usersService.getGamesListener().subscribe(newGames => {
    //   this.playableGames = newGames.filter(element => element !== this.loggedUserEmail);
    // });
    // this.playableGamesSub = this.usersService.getGamesListener().subscribe(newGames => {
    //   console.log('questi sono i newGames ad una aggiunta: ' + JSON.stringify(newGames));
    //   this.playableGames = newGames.filter(element => {
    //     console.log('this.loggedUserEmail: ' + this.loggedUserEmail);
    //     console.log('element per element: ' + element);
    //     console.log('element !== this.loggedUserEmail? ' + (element != this.loggedUserEmail));
    //     console.log('this.loggedEmails.includes(element): ' + this.loggedEmails.includes(element));

    //     return ((element != this.loggedUserEmail)
    //       // && (!this.activePlayers || this.activePlayers.length <1 || !this.activePlayers.includes(element))
    //       // && this.loggedEmails
    //       && this.loggedEmails.includes(element))
    //   });
    //   // this.playableGames = this.games;
    //   console.log('questi sono ora i playable games: ' + this.playableGames);
    // });
  }

  updatePlayableGames() {
    this.playableGames = this.games.filter(element => {
      return (
        (element != this.loggedUserEmail)
        && this.loggedEmails.includes(element)
        && (!this.activePlayers || this.activePlayers.length < 1 || !this.activePlayers.includes(element))
      );
    })
  }

  onStartBattle(game: string) {
    this.battleService.startBattle(game);
    console.log('Questo è il parametro game passato: ' + game);
    // this.battleService.createBoards();
    // this.router.navigate(['/battle']);
  }

  ngOnDestroy() {
    this.activePlayersSub.unsubscribe();
    this.gamesSub.unsubscribe();
    this.loggedEmailSub.unsubscribe();
    this.loggedEmailsSub.unsubscribe();
    // this.playableGamesSub.unsubscribe();
  }
}
