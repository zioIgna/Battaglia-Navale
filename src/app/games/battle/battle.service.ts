import { Injectable } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { PlayerComponent } from './player/player.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BattleService {

  private boards: BoardComponent[] = [];
  private boardsListener = new Subject<BoardComponent[]>();
  boardSize = 10;
  playersNumber = 2;
  currPlayer = 0;

  constructor() { }

  getBoards() {
    return [...this.boards];
  }

  getBoardsListener() {
    return this.boardsListener.asObservable();
  }

  createBoards() {    // invocata da onInit al verificarsi di condizione: loggedPlayers === 2
    for (let i = 0; i < this.playersNumber; i++) {
        const player = new PlayerComponent();
        player.id = i;
        const board = new BoardComponent();
        board.player = player;
        board.tiles = this.setTiles();
        this.boards.push(board);
        this.boardsListener.next([...this.boards]);
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

  // startBattle() {
  //   this.createBoards();
  // }

  getPosition(e: any) {}
}
