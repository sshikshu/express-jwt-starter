'use strict';

import {IHttpError} from '../interfaces';

export class HttpError extends Error implements IHttpError {
    private _statusCode: number;
    private _name: string;

    constructor(message: string, statusCode: number, name: string) {
        super(message);
        this._statusCode = statusCode;
        this._name = name;
    }

    get status(): number {
        return this._statusCode;
    }

    get name(): string {
        return this._name;
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string) {
        super(message, 400, 'BadRequestError');
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string) {
        super(message, 401, 'UnauthorizedError');
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string) {
        super(message, 403, 'ForbiddenError');
    }
}

export class NotFoudError extends HttpError {
    constructor(message: string) {
        super(message, 404, 'NotFoudError');
    }
}

export class MethodNotAllowedError extends HttpError {
    constructor(message: string) {
        super(message, 405, 'MethodNotAllowedError');
    }
}

export class NotAcceptableError extends HttpError {
    constructor(message: string) {
        super(message, 406, 'NotAcceptableError');
    }
}

export class ConflictError extends HttpError {
    constructor(message: string) {
        super(message, 409, 'ConflictError');
    }
}

export class PreConditionFailedError extends HttpError {
    constructor(message: string) {
        super(message, 412, 'PreConditionFailedError');
    }
}

export class ExpectationFailedError extends HttpError {
    constructor(message: string) {
        super(message, 417, 'ExpectationFailedError');
    }
}

export class UnprocessableEntityError extends HttpError {
    constructor(message: string) {
        super(message, 422, 'UnprocessableEntityError');
    }
}
