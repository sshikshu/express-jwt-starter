'use strict';
import * as express from 'express';

import {jwtCheck} from './verify';

import * as utilities from '../common/utilities';
import {User} from '../Users/models';
import {IUserIdentity} from '../Users/interfaces';
import {IWebToken} from '../common/interfaces';

export function setup(router: express.Router): void {
  router.post('/', (req: express.Request, res: express.Response, next: Function): void => {
    let identity: IUserIdentity = {
      _id: req.body._id,
      email: req.body.email,
      nickname: req.body.nickname,
    };
    User.retreiveItem(identity, req.body.password || '')
      .then((user: User): void => {
        res.status(201).json({ token: utilities.webtoken.create(user.id, user.isValidated), payload: user });
      }).catch((err: Error): void => { next(err); });
  });

  router.put('/', jwtCheck, (req: express.Request, res: express.Response, next: Function): void => {
    let user: IWebToken = req.user;
    utilities.webtoken.revoke(user).then((isRevoked: boolean) => {
      res.status(201).json({ token: utilities.webtoken.create(user.id, user.isValidated), payload: user });
    }).catch((err: Error): void => { next(err); });
  });

  router.delete('/', jwtCheck, (req: express.Request, res: express.Response, next: Function): void => {
    utilities.webtoken.revoke(<IWebToken>req.user).then((isRevoked: boolean) => {
      res.status(200).json({});
    }).catch((err: Error) => { next(err); });
  });
}
