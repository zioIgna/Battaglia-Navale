import { Component, OnInit } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { PlayerComponent } from './player/player.component';
import { BattleService } from './battle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css']
})
export class BattleComponent implements OnInit {

  boards: BoardComponent[] = [];
  boardsSub: Subscription;

  constructor(private battleService: BattleService) {}

  ngOnInit() {
    this.boards = this.battleService.getBoards();
    this.boardsSub = this.battleService.getBoardsListener().subscribe(updatedBoards => this.boards = updatedBoards);
  }

}
