import { Component, OnInit } from '@angular/core';
import { ConnectionService } from './connection.service';
import { UsersService } from './users/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private connessione: ConnectionService, private usersService: UsersService) { }

  ngOnInit() {
    // if (this.connessione.socket == null) {
    //   this.connessione.socket = this.connessione.getConnection();
    // }
    this.connessione.getConnection();
    console.log(this.connessione.socket);
    // socket.on('connection', () => {
    //   console.log('user connected');
    // });
    this.connessione.socket.on('new user', (obj) => {
      this.usersService.users.push(obj.payload);
      this.usersService.usersUpdated.next([...this.usersService.users]);
      // this.usersService.createUserNoPropagate(obj.payload.email, obj.payload.password);
      console.log(obj);
    });
  }


}
