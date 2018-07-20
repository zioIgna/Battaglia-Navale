import { Router } from '@angular/router';
import { ConnectionService } from '../connection.service';
import { User } from './user.model';
import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';

@Injectable({
    providedIn: 'root'
})
export class UsersService implements OnInit {

    private users: User[] = [];
    private usersUpdated = new Subject<User[]>();
    private token: string;
    private authStatusListener = new Subject<boolean>();
    private isAdmin = false;

    constructor(private connessione: ConnectionService, private http: HttpClient, private router: Router) { }

    getToken() {
        return this.token;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getUsers() {
        // return this.users;
        this.http.get<{ note: string, users: User[] }>('http://localhost:3000/api/users')
            .subscribe((usersData) => {
                console.log(usersData.note);
                console.log('questi sono i nuovi users', usersData.users);
                this.users = usersData.users;
                this.usersUpdated.next([...this.users]);
            });
    }

    getUsersUpdatedListener() {
        return this.usersUpdated.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {
            // id: null,
            email: email,
            password: password,
            // ruolo: 'basic'
        };
        // this.users.push(authData);
        console.log(this.users);
        // this.usersUpdated.next([...this.users]);
        this.http.post<{ note: string, datiSalvati: any, token: string }>('http://localhost:3000/api/users/signup', authData)
            .subscribe((responseData) => {
                console.log(responseData.note);
                console.log('questi sono i savedData: ', responseData.datiSalvati);
                this.connessione.socket.emit('new user', { message: 'nuovo utente registrato', payload: authData });  // linea aggiunta
                const token = responseData.token;
                this.token = token;
                this.router.navigate(['/overview']);
            }, (err) => {
                console.log(err);
            });
    }

    login(email: string, password: string) {
        const authData: AuthData = {
            email: email,
            password: password
        };
        this.http.post<{ token: string, userRole: string }>('http://localhost:3000/api/users/login', authData)
            .subscribe(response => {
                console.log('questa è la risposta al login: ', response);
                const token = response.token;
                this.token = token;
                this.isAdmin = (response.userRole === 'admin');
                console.log('è amministratore? ', this.isAdmin);
                this.authStatusListener.next(true);
                this.router.navigate(['/overview']);
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
