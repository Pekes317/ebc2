import { Component, DoCheck, OnInit } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { ItemBase } from './base.component';
import { BackandItemService, BackandConfigService } from '../../../providers';

@Component({
	selector: 'page-items',
	templateUrl: 'base.component.html'
})
export class MyCardsPage extends ItemBase implements DoCheck, OnInit {
	dbTable = 'items';
	delete = true;
	itemType = 'MyCard';
	title: string = 'My Cards';
	type = 'Card';
	

	constructor(public config: BackandConfigService, public backand: BackandItemService, public nav: NavController, public toast: ToastController) {
		super(config, backand, nav, toast);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	ngDoCheck() {
		super.ngDoCheck();
	}
}