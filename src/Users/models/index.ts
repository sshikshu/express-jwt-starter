'use strict';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import {Promise} from 'es6-promise';

import {UserModel} from './mongoose';
import {IUserData, IUserDocument, IUserIdentity} from '../interfaces';

import {HttpError, UnauthorizedError} from '../../common/errors/http';
import {IPromiseReject, IPromiseResolve} from '../../common/interfaces';


export class User {

  private _document: IUserDocument;

  public static deleteItem(_id: string): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject): void => {
      UserModel.findByIdAndRemove(_id).exec().then((user: IUserDocument) => {
        if (user) {
          return resolve(new User(user));
        } else {
          return reject(new UnauthorizedError('Invalid username or password'));
        }
      }, reject);
    });
  }

  public static retreiveItem(userIdentity: IUserIdentity, password: string): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject) => {
      User.findUser(userIdentity).then((user: User) => {
        if (!user) {
          return reject(new UnauthorizedError('Invalid username or password'));
        }
        return user.verifyPassword(password).then(resolve, reject);
      }, reject);
    });
  }

  public static updateItem(id: string, userData: IUserData): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject) => {
      UserModel.findById(id).exec().then((userDocument: IUserDocument) => {
        if (!userDocument) {
          return reject(new UnauthorizedError('Invalid username or password'));
        }
        for (let key in userData) {
          if (userData.hasOwnProperty(key)) {
            if (userData[key]) {
              userDocument[key] = userData[key];
            }
          }
        }
        userDocument.save().then(resolve, reject);
      }, reject);
    });
  }

  private static findUser(userIdentity: IUserIdentity): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject) => {
      let mongoPromise: mongoose.Promise<IUserDocument>;
      if (userIdentity._id) {
        mongoPromise = UserModel.findById(userIdentity._id).exec();
      } else if (userIdentity.email) {
        mongoPromise = UserModel.findOne({ email: userIdentity.email }).exec();
      } else if (userIdentity.nickname) {
        mongoPromise = UserModel.findOne({ nickname: userIdentity.nickname }).exec();
      } else {
        return reject(new UnauthorizedError('User identity missing'));
      }
      mongoPromise.then((user: IUserDocument): void => {
        if (!user) {
          return reject(new UnauthorizedError('Invalid username or password'));
        }
        return resolve(new User(user));
      }, reject);
    });
  }

  public save(): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject) => {
      this._document.save().then((user: IUserDocument) => {
        if (!user) {
          return reject(new UnauthorizedError('Invalid username or password'));
        }
        return resolve(new User(user));
      }, reject);
    });
  }

  private verifyPassword(password: string): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject) => {
      bcrypt.compare(password, this._document.password, (err: HttpError, isMatch: boolean) => {
        if (err) {
          return reject(err);
        }
        if (!isMatch) {
          return reject(new UnauthorizedError('Invalid username or password'));
        }
        return resolve(this);
      });
    });
  }

  constructor(user: IUserData | IUserDocument) {
    this._document = new UserModel(user);
  }

  get id(): string {
    return this._document._id.toHexString();
  }

  set id(id: string) {
    this.id = id;
  }

  get email(): string {
    return this._document.email;
  }

  get name(): string {
    return this._document.name;
  }

  get nickname(): string {
    return this._document.nickname;
  }

  get password(): string {
    return this._document.password;
  }
}
