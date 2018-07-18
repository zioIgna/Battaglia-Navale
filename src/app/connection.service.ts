import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
// import { UsersService } from './users/users.service';

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    socket = null;

    // ngOnInit() {
    //     this.socket = socketIo('http://localhost:3000');
    // }

    // constructor(private usersService: UsersService) { }

    getConnection() {
        if (this.socket === null) {
            this.socket = socketIo('http://localhost:3000');
        }
    }


}
