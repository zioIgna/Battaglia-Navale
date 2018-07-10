import { MessageCreateComponent } from './messages/message-create/message-create.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, } from '@angular/router';
import { MsgListComponent } from './messages/msg-list/msg-list.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/signup/signup.component';

const routes: Routes = [
    { path: '', component: MsgListComponent },
    { path: 'create', component: MessageCreateComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignUpComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModudle { }
