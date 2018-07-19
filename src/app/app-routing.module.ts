import { NgModule } from '../../node_modules/@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { MessageCreateComponent } from './messages/message-create/message-create.component';
import { MsgListComponent } from './messages/msg-list/msg-list.component';

const routes: Routes = [
    { path: '', component: UserLoginComponent },
    {
        path: 'overview', component: OverviewComponent,
        children: [
            { path: '', component: UsersListComponent },
            { path: '', component: MessageCreateComponent },
            { path: '', component: MsgListComponent }
        ]
    },
    { path: 'signup', component: UserCreateComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}