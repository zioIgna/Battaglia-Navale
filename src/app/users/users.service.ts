import { ConnectionService } from './../connection.service';
import { User } from './user.model';
import { Injectable, OnInit } from '@angular/core';
import { Subject } from '../../../node_modules/rxjs';
import { HttpClient } from '../../../node_modules/@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class UsersService implements OnInit {

    users: User[] = [];
    usersUpdated = new Subject<User[]>();

    constructor(private connessione: ConnectionService, private http: HttpClient) { }

    getUsers() {
        // return this.users;
        this.http.get<{ note: string, users: User[] }>('http://localhost:3000/api/users')
            .subscribe((usersData) => {
                console.log(usersData.note);
                this.users = usersData.users;
                this.usersUpdated.next([...this.users]);
            });
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
        // this.users.push(user);
        console.log(this.users);
        // this.usersUpdated.next([...this.users]);
        this.http.post<{ note: string }>('http://localhost:3000/api/users', user)
            .subscribe((responseData) => {
                console.log(responseData.note);
                this.connessione.socket.emit('new user', { message: 'nuovo utente registrato', payload: user });  // linea aggiunta
            }, (err) => {
                console.log(err);
            });
    }

    // createUserNoPropagate(email: string, password: string) {
    //     const user: User = {
    //         id: null,
    //         email: email,
    //         password: password,
    //         ruolo: 'basic'
    //     };
    //     this.users.push(user);
    //     console.log(this.users);
    //     this.usersUpdated.next([...this.users]);
    // }

    ngOnInit() {
        this.connessione.getConnection();
    }

}
