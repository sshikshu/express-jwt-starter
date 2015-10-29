'use strict';

import * as mongoose from 'mongoose';


export interface IUserIdentity {
  _id?: string;
  email?: string;
  nickname?: string;
}

export interface IUserData {
  email: string;
  name: string;
  nickname: string;
  password: string;
  validation?: IValidationObject
}

export interface IValidationObject {
  email: IValidationData
}

export interface IValidationData {
  sent: string,
  received: string
}


export interface IUserDocument extends IUserData, mongoose.Document { }

export interface IUserModel extends mongoose.Model<IUserDocument> { }
