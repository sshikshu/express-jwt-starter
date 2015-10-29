'use strict';
import * as express from 'express';
import * as nodemailer from 'nodemailer';

import {User} from './models';
import {IUserData} from './interfaces';

import {jwtCheck} from '../Token/verify';


function readUserData(data: IUserData): IUserData {
  let user: IUserData = <IUserData>{};
  if (data.email) {
    user.email = data.email;
  }
  if (data.name) {
    user.name = data.name;
  }
  if (data.nickname) {
    user.nickname = data.nickname;
  }
  if (data.password) {
    user.password = data.password;
  }
  return user;
}

export function setup(router: express.Router): void {
  router.post('/', (req: express.Request, res: express.Response, next: Function): void => {
    new User(readUserData(req.body)).save()
      .then((user: User): void => { res.status(201).json({ payload: user }); })
      .catch((err: Error): void => { next(err); });
  });

  router.post('/verify/email/send', jwtCheck, (req: express.Request, res: express.Response, next: Function): void => {
    User.findUser({ _id: req.user._id }).then((user: User) => { return user.sendValidationEmail(); })
      .then((info: nodemailer.SentMessageInfo) => { res.status(200).json({ payload: info }); })
      .catch((err: Error): void => { next(err); });
  });

  router.get('/verify/:medium/receive', jwtCheck, (req: express.Request, res: express.Response, next: Function): void => {
    let medium = req.params.medium || 'email';
    let userId = req.query.id || '';
    let receivedToken = req.query.token || '';
    User.findUser({ _id: userId })
      .then((user: User) => { return user.validateMedium(receivedToken, medium); })
      .then((user: User) => {
        let userData: IUserData = <IUserData>{};
        userData.validation = user.validation;
        userData.validation[medium] = {
          received: user.validation[medium].sent,
          sent: user.validation[medium].sent
        };
        return User.updateItem(user.id, userData);
      }).then((user: User) => { return res.status(200).json({ payload: user }); })
      .catch((err: Error): void => { next(err); });
  });

  router.patch('/', jwtCheck, (req: express.Request, res: express.Response, next: Function): void => {
    User.updateItem(req.user._id, readUserData(req.body))
      .then((user: User): void => { res.status(200).json({ payload: user }); })
      .catch((err: Error): void => { next(err); });
  });

  router.delete('/', jwtCheck, (req: express.Request, res: express.Response, next: Function): void => {
    User.deleteItem(req.user._id)
      .then((user: User): void => { res.status(200).json({ payload: user }); })
      .catch((err: Error): void => { next(err); });
  });
}
