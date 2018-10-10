import { UsersService } from 'src/app/users/users.service';
import { GamesService } from './../games.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit {
  games: string[] = ['Player1', 'Player2', 'Player3', 'ignaziocarbonaro@hotmail.com'];
  private loggedUserEmail: string;
  private loggedEmailSub: Subscription;

  constructor(private gamesService: GamesService, private usersService: UsersService) { }

  ngOnInit() {
    this.loggedUserEmail = this.usersService.getLoggedEmail();
    console.log('Il loggedUserEmail è: ' + this.loggedUserEmail);
    this.loggedEmailSub = this.usersService.getLoggedEmailListener().subscribe(loggedUser => {
      this.loggedUserEmail = loggedUser;
      console.log('Il loggedUserEmail è: ' + this.loggedUserEmail);
    });
  }
}
