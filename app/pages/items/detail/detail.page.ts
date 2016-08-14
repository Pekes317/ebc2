import { Validators, REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup } from '@angular/forms';
import { Component, Renderer, OnInit } from '@angular/core';
import { DomSanitizationService, SafeResourceUrl } from '@angular/platform-browser';
import { NavParams, Platform, ToastController } from 'ionic-angular';
import { Contacts, SMS, EmailComposer, AppAvailability, InAppBrowser, LaunchNavigator } from 'ionic-native';

import { BackandService, FormHandler } from '../../../services';
import { NavComponent } from '../../shared/nav';
import { EbcProduct } from '../../';

@Component({
  templateUrl: 'build/pages/items/detail/detail.page.html',
  directives: [NavComponent, REACTIVE_FORM_DIRECTIVES]
})

export class DetailPage implements OnInit {
  body: FormControl = new FormControl('');
  email: FormControl = new FormControl('', this.form.emailValidator);
  emailForm: FormGroup;
  field: string;
  hide: boolean = false;
  item: EbcProduct;
  media: SafeResourceUrl;
  message: string = '';
  phone: FormControl = new FormControl('');
  picked: Array<any>;
  pickPhone: string = '';
  sample: boolean;
  smsForm: FormGroup;
  text: FormControl = new FormControl('');
  type: string;

  constructor(public safe: DomSanitizationService, public backand: BackandService, public form: FormHandler, public params: NavParams, private platform: Platform, private render: Renderer, private toast: ToastController) {
    this.params = params;
    this.platform = platform;
    this.text['_value'] = 'Something Cool';
    this.smsForm = new FormGroup({
      phone: this.phone,
      text: this.text
    });
    this.emailForm = new FormGroup({
      email: this.email,
      text: this.text,
      body: this.body
    });
  }

  ngOnInit() {
    this.itemDetail();
    this.isSample();
  }

  clickCheck() {
    let app = {};
    if (this.platform.is('mobile')) {
      let my = <SVGElement>document.getElementById('myItem')['contentDocument'];

      this.render.listen(my, 'click', (e) => {
        let clicked = e.target['parentNode'];
        if (clicked['href']) {
          let link = clicked['href']['baseVal'];
          let data = clicked['attributes'][2]['value'];
          console.log(e, data);
          if (e.target['id'] === 'address') {
            e.preventDefault();
            LaunchNavigator.navigate(data)
              .then(
              success => console.log('Launched navigator'),
              error => console.log('Error launching navigator', error)
              );
          }
          if (link.includes('facebook')) {
            e.preventDefault();
            app = {
              appName: 'fb',
              url: link,
              appLink: `fb://facewebmodal/f?href=${link}`
            };
            this.isAvail(app);
          };
          if (link.includes('instagram')) {
            e.preventDefault();
            app = {
              appName: 'dm',
              url: link,
              appLink: `instagram://user?username=${data}`
            };
            this.isAvail(app);
          };
        };
      });
    }
  }

  getContact() {
    Contacts.pickContact().then((contact) => {
      this.picked = contact;
      this.hide = true;
      console.log(this.picked, this.picked['name'], this.picked['phoneNumbers'], this.picked['emails']);
    });
  }

  isAvail(app: Object) {
    let myApp = app;
    let fb;
    let dm;

    if (this.platform.is('ios')) {
      fb = 'fb://';
      dm = 'instagram://';
    } else if (this.platform.is('android')) {
      fb = 'com.facebook.katana';
      dm = 'com.instagram.android';
    }
    if (myApp['appName'] === 'fb') {
      Object.defineProperty(myApp, 'check', {
        value: fb
      });
    }
    if (myApp['appName'] === 'dm') {
      Object.defineProperty(myApp, 'check', {
        value: dm
      });
    }

    AppAvailability.check(myApp['check'])
      .then(
      yes => {
        InAppBrowser.open(myApp['appLink'], '_system');
      },
      no => {
        InAppBrowser.open(myApp['url'], '_system');
      }
      );
  }

  isSample() {
    let obj = this.params.get('table');

    if (obj === 'samples') {
      this.sample = true;
    } else {
      this.sample = false;
    }
  }

  isType() {
    if (this.item['flyer']) {
      this.type = 'Flyer';
    } else {
      this.type = 'Card';
    }
  }

  itemDetail() {
    let obj = this.params.get('table');
    let id = this.params.get('index');

    this.backand.getItem(obj, id).subscribe(
      data => {
        this.item = data;
        this.media = this.safe.bypassSecurityTrustResourceUrl(this.item.media);
        this.isType();
      },
      err => {
        var errorMessage = this.backand.extractErrorMessage(err);
        this.backand.authStatus = `Error: ${errorMessage}`;
        this.backand.logError(err);
      });
  }

  sendEmail(form) {
    let myInput = form.value;
    let myEmail = {
      to: myInput.email,
      subject: myInput.text,
      body: `<p>${myInput.body}</p>${this.item['media']}`,
      isHtml: true
    };

    EmailComposer.open(myEmail).then(
      data => this.sentMsg('Email'),
      err => console.log(err, 'Fail'));
  }

  sentMsg(type: string) {
    let isSent = this.toast.create({
      message: `Your ${type} as been Sent`,
      duration: 5000
    });

    isSent.present();
  }

  sendSms(form) {
    let mySms = form.value;
    let body = `${mySms.text} ${this.item['media']}`;

    SMS.send(mySms.phone, body).then(
      data => console.log(data, 'Sent'),
      err => this.sentMsg('SMS Text'));
  }
}