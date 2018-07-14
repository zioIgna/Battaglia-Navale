import { User } from './user.model';
import { Injectable } from '@angular/core';
import { Subject } from '../../../node_modules/rxjs';

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private users: User[] = [];
    private usersUpdated = new Subject<User[]>();

    constructor() { }

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
    }

}
