import { Component, OnInit } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { PlayerComponent } from './player/player.component';
import { BattleService } from './battle.service';
import { Subscription } from 'rxjs';
import { ConnectionService } from 'src/app/connection.service';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css']
})
export class BattleComponent implements OnInit {

  boards: BoardComponent[] = [];
  boardsSub: Subscription;
  binaryId: number;
  binaryIdSub: Subscription;
  currPlayer: number;
  endGame: boolean;
  endGameSub: Subscription;
  orientation: string;
  orientationSub: Subscription;
  positionedShips: number;

  constructor(private battleService: BattleService, private connectionService: ConnectionService) {}

  ngOnInit() {
    this.boards = this.battleService.getBoards();
    this.boardsSub = this.battleService.getBoardsListener().subscribe(updatedBoards => this.boards = updatedBoards);
    this.binaryId = this.connectionService.binaryId;
    this.binaryIdSub = this.connectionService.getId().subscribe(newId => this.binaryId = newId);
    this.currPlayer = this.battleService.currPlayer;
    this.endGame = this.battleService.endGame;
    this.endGameSub = this.battleService.getEndGameListener().subscribe( newValue => this.endGame = newValue);
    this.positionedShips = this.battleService.positionedShips;
    this.orientation = this.battleService.orientation;
    this.orientationSub = this.battleService.getOrientationListener().subscribe(newOrientation => this.orientation = newOrientation);
  }

  onGetPosition(e: any) {
    this.battleService.getPosition(e);
  }

  onGetMyBattle() {
    return this.battleService.getMyBattle();
  }

  onSetHorizontal() {
    this.battleService.setHorizontal();
  }

  onSetVertical() {
    this.battleService.setVertical();
  }

}
