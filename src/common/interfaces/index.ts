'use strict';

export interface IDoneCallback<T> { (err: Error, result: T): void; }

export interface IHttpError extends Error {
  status?: number;
}

export interface IPromiseResolve<T> {
  (value: T): void;
}

export interface IPromiseReject {
  (err: Error): void;
}

export interface IPartialToken {
  id: string,
  jti: string,
  isValidated: boolean,
}

export interface IJsonWebToken {
  iss: string;
  sub?: string;
  aud: string;
  exp: number;
  nbf?: number;
  iat: number;
  jti: string;
}

export interface IWebToken extends IJsonWebToken { id: string; isValidated: boolean; }
