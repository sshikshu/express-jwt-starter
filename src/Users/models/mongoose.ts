'use strict';
import * as mongoose from 'mongoose';

import {setEmailValidationToken, saltPassword, validateEmail} from './hooks';
import {IUserDocument, IUserModel} from '../interfaces';


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
  validation: {
    email: {
      sent: { type: String },
      received: { type: String }
    }
  },
});

userSchema.pre('save', saltPassword);
userSchema.pre('save', setEmailValidationToken);

export let UserModel: IUserModel = mongoose.model<IUserDocument>('User', userSchema);