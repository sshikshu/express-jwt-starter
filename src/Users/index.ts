'use strict';
import * as express from 'express';

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
