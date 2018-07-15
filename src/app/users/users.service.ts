import { ConnectionService } from './../connection.service';
import { User } from './user.model';
import { Injectable, OnInit } from '@angular/core';
import { Subject } from '../../../node_modules/rxjs';

@Injectable({
    providedIn: 'root'
})
export class UsersService implements OnInit {

    private users: User[] = [];
    private usersUpdated = new Subject<User[]>();

    constructor(private connessione: ConnectionService) { }

    getUsers() {
        return this.users;
    }

    getUsersUpdatedListener() {
        return this.usersUpdated.asObservable();
    }

    createUser(email: string, password: string) {
        const user: User = {
            id: null,
            email: email,
            password: password,
            ruolo: 'basic'
        };
        this.users.push(user);
        console.log(this.users);
        this.usersUpdated.next([...this.users]);
        this.connessione.socket.emit('new user', { message: 'nuovo utente registrato', payload: user });  // linea aggiunta
    }

    createUserNoPropagate(email: string, password: string) {
        const user: User = {
            id: null,
            email: email,
            password: password,
            ruolo: 'basic'
        };
        this.users.push(user);
        console.log(this.users);
        this.usersUpdated.next([...this.users]);
    }

    ngOnInit() {
        this.connessione.getConnection();
    }

}
