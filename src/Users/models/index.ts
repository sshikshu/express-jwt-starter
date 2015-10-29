'use strict';
import * as bcrypt from 'bcrypt';
import {Promise} from 'es6-promise';
import * as mongoose from 'mongoose';
import * as nodemailer from 'nodemailer';

import {UserModel} from './mongoose';
import {IValidationObject, IUserData, IUserDocument, IUserIdentity} from '../interfaces';

import {BadRequestError, HttpError, UnauthorizedError} from '../../common/errors/http';
import * as constants from '../../common/constants';
import {IPromiseReject, IPromiseResolve} from '../../common/interfaces';
import {createVerificationEmail} from '../../common/templates/email';

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

  public static findUser(userIdentity: IUserIdentity): Promise<User> {
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

  public sendValidationEmail(): Promise<nodemailer.SentMessageInfo> {
    let transporter = nodemailer.createTransport({
      service: constants.smtp.preset,
      auth: {
        user: constants.smtp.id,
        pass: constants.smtp.password
      },
    });

    var mailOptions = {
      from:constants.smtp.id,
      to: this.email,
      subject: 'it is the time to register',
      html: createVerificationEmail(this.id, this.name, this.nickname, this._document.validation.email.sent),
    };

    return new Promise<nodemailer.SentMessageInfo>((resolve: IPromiseResolve<nodemailer.SentMessageInfo>, reject: IPromiseReject) => {
      transporter.sendMail(mailOptions, (err: Error, info: any) => {
        if (err) {
          return reject(err);
        }
        return resolve(info);
      });
    });
  }

  public validateMedium(token: string, medium: string): Promise<User> {
    return new Promise<User>((resolve: IPromiseResolve<User>, reject: IPromiseReject) => {
      if (this._document.validation && this._document.validation[medium] && this._document.validation[medium].sent) {
        if (this._document.validation[medium].sent === token) {
          resolve(this);
        }
        return reject(new BadRequestError('Invalid token'));
      }
      return reject(new Error(`Token for ${medium} not present`));
    });
  }

  public isMediumValidated(medium: string): boolean {
    if (this._document.validation && this._document.validation[medium] && this._document.validation[medium].received && this._document.validation[medium].sent) {
      return this._document.validation[medium].received === this._document.validation[medium].sent;
    }
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

  get validation(): IValidationObject {
    return this._document.validation;
  }
}
