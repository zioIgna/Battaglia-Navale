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

  constructor(private battleService: BattleService, private connectionService: ConnectionService) {}

  ngOnInit() {
    this.boards = this.battleService.getBoards();
    this.boardsSub = this.battleService.getBoardsListener().subscribe(updatedBoards => this.boards = updatedBoards);
    this.binaryId = this.connectionService.binaryId;
    this.binaryIdSub = this.connectionService.getId().subscribe(newId => this.binaryId = newId);
  }

  onGetPosition(e: any) {
    this.battleService.getPosition(e);
  }

  onGetMyBattle() {
    return this.battleService.getMyBattle();
  }

}
