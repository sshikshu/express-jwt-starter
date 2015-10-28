'use strict';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';

import {IUserDocument, IUserModel} from '../interfaces';

function validateEmail(email: string): boolean {
  let re: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

let userSchema: mongoose.Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validateEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
});

function saltPassword(next: Function): void {
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, (saltErr: Error, salt: string) => {
      if (saltErr) {
        return next(saltErr);
      }
      bcrypt.hash(this.password, salt, (encryptErr: Error, hash: string): void => {
        if (encryptErr) {
          return next(encryptErr);
        }
        this.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
}

userSchema.pre('save', saltPassword);

export let UserModel: IUserModel = mongoose.model<IUserDocument>('User', userSchema);
