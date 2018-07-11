import { MessageCreateComponent } from './messages/message-create/message-create.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, } from '@angular/router';
import { MsgListComponent } from './messages/msg-list/msg-list.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
    { path: '', component: MsgListComponent, canActivate: [AuthGuard] },
    { path: 'create', component: MessageCreateComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignUpComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModudle { }
