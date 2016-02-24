import {FORM_DIRECTIVES, Validators, NgFormModel, ControlGroup, Control} from 'angular2/common';
import {Type} from 'angular2/core';
import {Page, NavController} from 'ionic-framework/ionic';
import {Backand} from '../../components/backand/backand';
import {ClearField} from '../../components/clearfield/clearfield';
import {CreatePage} from '../create/create';
import {SideMenu} from '../sidemenu/sidemenu';

@Page({
  templateUrl: 'build/pages/login/login.html',
  directives: [FORM_DIRECTIVES, ClearField],
  providers: [Backand]
})

export class LoginPage {
  signUp: Type = CreatePage;
  loginForm: ControlGroup;
  signed: boolean;
  

  constructor(private nav: NavController, public backand: Backand) {
    this.nav = nav;
    this.loginForm = new ControlGroup({
      username: new Control('', Validators.required),
      password: new Control('', Validators.required)
    });
  }

  openPage(page){
    this.nav.push(page);
  }

  loggedIn(){
    let nav = this.nav;
    nav.setPages([{page: SideMenu}], {animate: true});
  }
  
  signIn(login){
    let auth = login.value;
    
    this.backand.signIn(auth.username, auth.password).subscribe(
      data => {
        this.backand.auth_status = 'OK';
        this.backand.is_auth_error = false;
        this.backand.setTokenHeader(data);
      },
      err => {
        var errorMessage = this.backand.extractErrorMessage(err);

        this.backand.auth_status = `Error: ${errorMessage}`;
        this.backand.is_auth_error = true;
        this.backand.logError(err);
      },
      () => {
        console.log('Finish Auth');
        this.loggedIn();
      });
  }
}
