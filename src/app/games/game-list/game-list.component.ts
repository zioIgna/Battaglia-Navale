import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit {

  games: string[] = ['Player1', 'Player2', 'Player3'];

  constructor() { }

  ngOnInit() {
  }

}
