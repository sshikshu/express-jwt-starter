'use strict';
import * as express from 'express';
import * as expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';

import * as constants from '../common/constants';
import {IDoneCallback, IWebToken} from '../common/interfaces';
import {redisClient} from '../common/redis';


function isRevoked(req: express.Request, payload: IWebToken, callback: IDoneCallback<boolean>): void {
  let tokenId: string = payload.jti;
  if (!tokenId) {
    return callback(null, false);
  }

  redisClient.get(tokenId, (err: Error, data: string) => {
    return callback(err, !!data);
  });
}

function getToken(req: express.Request): string {
  let authorization: string = req.header('authorization');
  if (authorization) {
    let parts: Array<string> = authorization.split(' ');
    if (parts.length === 2) {
      let scheme: string = parts[0];
      let credentials: string = parts[1];
      let token: string;
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
        if (jwt.decode(token)) {
          return token;
        } else {
          return null;
        }
      }
    }
  }
  return null;
}

export let jwtCheck: expressJwt.RequestHandler = expressJwt({
  audience: constants.webtoken.audience,
  getToken: getToken,
  issuer: constants.webtoken.issuer,
  secret: constants.webtoken.secret,
  isRevoked: isRevoked,
});

export let jwtPermissiveCheck: expressJwt.RequestHandler = expressJwt({
  audience: constants.webtoken.audience,
  getToken: getToken,
  issuer: constants.webtoken.issuer,
  secret: constants.webtoken.secret,
  isRevoked: isRevoked,
  credentialsRequired: false,
});
