import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { UserInfo } from 'firebase';
import { Observable } from 'rxjs';

import { FormHandlerService } from '../../providers/form-handler.service';
import { AuthUser } from '../../models/user.model';
import { UploadOpts, UploadImg } from '../../models/app.model';
import { UsersDataService } from '../../providers/users-data.service';
import * as fromUser from '../../state/user-store/reducers';
import {
  LoadPicture,
  UploadPicture,
  UnloadPicture,
} from '../../state/user-store/actions/picture.actions';
import { UpdateUserName } from '../../state/user-store/actions/user.actions';
import { PictureState } from '../../state/user-store/models/picture-state.model';

@Component({
  selector: 'ebc-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnDestroy, OnInit {
  confirm: FormControl = new FormControl('', Validators.required);
  editForm: FormGroup;
  displayName: FormControl = new FormControl('');
  newPicture: Observable<PictureState> = this.store.pipe(
    select(fromUser.selectPic),
  );
  passwordForm: FormGroup;
  password: FormControl = new FormControl('', Validators.required);
  section = 'user';
  upFile = false;
  userData: Observable<AuthUser> = this.store.pipe(select(fromUser.selectUser));

  constructor(
    private changeRef: ChangeDetectorRef,
    private form: FormHandlerService,
    private store: Store<fromUser.UserState>,
    private toast: ToastController,
    private user: UsersDataService,
  ) {}

  ngOnInit() {
    this.editForm = new FormGroup({
      displayName: this.displayName,
    });
    this.passwordForm = new FormGroup(
      {
        password: this.password,
        confirm: this.confirm,
      },
      this.form.areEqual,
    );
  }

  ngOnDestroy() {
    this.store.dispatch(new UnloadPicture());
  }

  editInfo(info: FormGroup) {
    const input = info.value;
    this.user.updateUser(input).subscribe((user: UserInfo) => {
      this.store.dispatch(
        new UpdateUserName({ displayName: user.displayName }),
      );
      this.profileUpdated('Username');
      this.editForm.reset();
    });
  }

  editPass(pass: FormGroup) {
    const newPass = {
      password: pass.value.password,
    };
    this.user.updateUser(newPass).subscribe(() => {
      this.profileUpdated('Password');
      this.passwordForm.reset();
    });
  }

  async errorToast(message: string) {
    const errMess = await this.toast.create({
      message: message,
      position: 'top',
      duration: 5000,
    });

    errMess.present();
  }

  imgTrigger(newImg: PictureState) {
    if (newImg.newPic) {
      return this.picMenu(newImg);
    }
    return this.savePic(newImg);
  }

  picMenu(img: PictureState) {
    this.store.dispatch(new LoadPicture(img));
    this.changeRef.detectChanges();
  }

  async profileUpdated(action: string) {
    const editSuccess = await this.toast.create({
      message: `Your ${action} has been updated`,
      position: 'top',
      duration: 5000,
    });

    editSuccess.present();
  }

  savePic(img: PictureState) {
    const picOpt: UploadOpts = {
      upload_preset: 'usersPic',
      tags: ['profile'],
    };
    const picUpload: UploadImg = {
      img: img.picFile,
      opts: picOpt,
    };
    this.store.dispatch(new UploadPicture(picUpload));
  }
}
