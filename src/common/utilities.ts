'use strict';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'node-uuid';
import {Promise} from 'es6-promise';

import * as constants from './constants';
import {redisClient} from './redis';
import {IPartialToken, IPromiseResolve, IPromiseReject, IWebToken} from './interfaces';
import {BadRequestError} from './errors/http';


export namespace webtoken {
  export function revoke(payload: IWebToken): Promise<boolean> {
    return new Promise<boolean>((resolve: IPromiseResolve<boolean>, reject: IPromiseReject) => {
      let tokenId: string = payload.jti;
      if (!tokenId) {
        reject(new BadRequestError('JTI not present'));
      }
      redisClient.set(tokenId, 'true', function(err: Error): void {
        if (err) {
          return reject(err);
        }
        redisClient.expire(tokenId, constants.webtoken.expiresIn);
        resolve(true);
      });
    });
  }

  export function create(id: string, isValidated: boolean): string {
    let data: IPartialToken = { id: id, jti: uuid.v4(), isValidated: isValidated };
    let token: string = jwt.sign(data, constants.webtoken.secret, {
      expiresIn: constants.webtoken.expiresIn,
      audience: constants.webtoken.audience,
      issuer: constants.webtoken.issuer,
    });
    return token;
  }
}
