import { Component, OnInit } from '@angular/core';
import { AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PrivatePolicyComponent } from '../components/private-policy/private-policy.component';

@Component({
  selector: 'ebc-about-help',
  templateUrl: './about-help.page.html',
  styleUrls: ['./about-help.page.scss']
})
export class AboutHelpPage implements OnInit {
  appName: string = 'EBC';
  appVer: string = '2.1.0';
  appVerCode: string | number = '20100';
  year: number = new Date().getFullYear();

  constructor(
    private alert: AlertController,
    private appVersion: AppVersion,
    private model: ModalController,
    private nav: IonRouterOutlet,
    private social: SocialSharing
  ) {}

  ngOnInit() {}

  getApp() {
    this.appVersion
      .getAppName()
      .then(res => (this.appName = res))
      .catch(err => console.log(err));
  }

  getCode() {
    this.appVersion
      .getVersionCode()
      .then(res => (this.appVerCode = res))
      .catch(err => console.log(err));
  }

  getVer() {
    this.appVersion
      .getVersionNumber()
      .then(res => (this.appVer = res))
      .catch(err => console.log(err));
  }

  goBack() {
    this.nav.pop();
  }

  async helpEmail() {
    let email = ['ebc.support@ebc.beezleeart.com'];
    let emailAlert = await this.alert.create({
      header: 'Feedback/Help Email',
      inputs: [
        {
          name: 'subject',
          placeholder: 'Subject',
          type: 'text'
        },
        {
          name: 'message',
          placeholder: 'Brief Message',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'reset-cancel',
        },
        {
          text: 'Send',
          handler: async data => {
            await this.social.shareViaEmail(
              data['message'],
              data['subject'],
              email
            );
          }
        }
      ]
    });

    emailAlert.present();
  }

  async policy() {
    const policyModel = await this.model.create({
      component: PrivatePolicyComponent
    });
    
    policyModel.present();   
  }
}