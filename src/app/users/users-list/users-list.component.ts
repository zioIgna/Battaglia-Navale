import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from './../user.model';
import { UsersService } from '../users.service';
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, OnDestroy {

    users: User[] = [];
    usersSub: Subscription;

    constructor(private usersService: UsersService) { }

    ngOnInit() {
        this.usersService.getUsers();
        this.usersSub = this.usersService.getUsersUpdatedListener().subscribe(fetchedUsers => {
            this.users = fetchedUsers;
        });
    }

    ngOnDestroy() {
        this.usersSub.unsubscribe();
    }

}
