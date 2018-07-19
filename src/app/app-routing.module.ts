import { NgModule } from '../../node_modules/@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { UserCreateComponent } from './users/user-create/user-create.component';

const routes: Routes = [
    { path: '', component: UserLoginComponent },
    { path: 'overview', component: OverviewComponent },
    { path: 'signup', component: UserCreateComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
