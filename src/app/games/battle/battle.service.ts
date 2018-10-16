import { Injectable, OnInit } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { PlayerComponent } from './player/player.component';
import { Subject, Subscription } from 'rxjs';
import { ConnectionService } from 'src/app/connection.service';
import { UsersService } from 'src/app/users/users.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BattleService implements OnInit {

  private boards: BoardComponent[] = [];
  private boardsListener = new Subject<BoardComponent[]>();
  boardSize = 10;
  playersNumber = 2;
  currPlayer = 0;
  activePlayers: string[] = [];
  private activePlayersSub: Subscription;
  // private activePlayersListener = new Subject<string[]>();

  constructor(private connection: ConnectionService, private usersService: UsersService, private router: Router) { }

  ngOnInit() {
    this.activePlayers = this.usersService.activePlayers;
    this.activePlayersSub = this.usersService.getActivePlayersListener()
      .subscribe(newActivePlayers => this.activePlayers = newActivePlayers);
  }

  getBoards() {
    return [...this.boards];
  }

  getBoardsListener() {
    return this.boardsListener.asObservable();
  }

  // sendActivePlayers(newActivePlayers) {
  //   this.activePlayersListener.next(newActivePlayers);
  // }

  // getActivePlayersListener() {
  //   return this.activePlayersListener.asObservable();
  // }

  createBoards(players) {
    for (let i = 0; i < this.playersNumber; i++) {
        const player = new PlayerComponent();
        player.id = i;
        const board = new BoardComponent();
        board.player = player;
        board.tiles = this.setTiles();
        this.boards.push(board);
        this.boardsListener.next([...this.boards]);
        this.usersService.getLoggedEmail() === players.nowPlaying[0] ? this.connection.binaryId = 0 : this.connection.binaryId = 1;
        console.log('Questa è la binaryId:  ' + this.connection.binaryId);
        this.router.navigate(['/battle']);
    }
  }

  setTiles() {
    const tiles = [];
    for (let i = 0; i < this.boardSize; i++) {
        tiles[i] = [];
        for (let j = 0; j < this.boardSize; j++) {
            tiles[i][j] = { used: false, value: '0', shipId: '' };
        }
    }
    return tiles;
  }

  startBattle(game) {
    const players = {nowPlaying: [game, this.usersService.getLoggedEmail()]};
    console.log('Questi sono i players passati: ' + players.nowPlaying);
    this.connection.socket.emit('start battle', players);
    // this.createBoards();
  }

  getPosition(e: any) {}
}
