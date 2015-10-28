///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../../dist/app.d.ts"/>
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import {expect} from 'chai';

import * as data from '../data';
import {Mongo, Token} from '../utilities';

import {IUserData} from '../../dist/Users/interfaces';
import {server} from '../../dist/app';
import {IJsonWebToken} from '../../dist/common/interfaces';
import * as constants from '../../dist/common/constants';

function validateJsonWebToken(err: Error, res: request.Response, done: MochaDone): void {
    if (err) {
        return done(err);
    }
    let tokenString: string = res.body.token;
    jwt.verify(tokenString, constants.webtoken.secret, (verifyErr: Error, decoded: IJsonWebToken) => {
        if (err) {
            return done(verifyErr);
        }
        expect(decoded.aud).equals(constants.webtoken.audience);
        expect(decoded.iss).equals(constants.webtoken.issuer);
        expect(decoded.iat).to.be.a('number');
        expect(decoded.exp).to.be.a('number');
        expect(decoded.exp - decoded.iat).equals(constants.webtoken.expiresIn);
        expect(decoded.jti).to.be.a('string');
        done();
    });
}



describe('Route /token', () => {
    let savedData: IUserData = data.users[0];
    let userData: IUserData = data.users[1];
    let mgo: Mongo;
    before((done: MochaDone): void => { mgo = new Mongo(done); });
    after((done: MochaDone): void => { mgo.close(done); });

    describe('GET', () => {
        it('should result in 404 Not Found', (done: MochaDone) => {
            request(server).get('/token').expect(404, done);
        });
    });
    describe('POST', () => {
        before((done: MochaDone): void => { mgo.saveUser(savedData, done); });
        after((done: MochaDone): void => { mgo.removeAllUsers(done); });

        it('no credential should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server).post('/token').expect(401, done);
        });

        it('wrong credentials should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server)
                .post('/token')
                .send({ nickname: savedData.nickname, password: userData.password })
                .expect(401, done);
        });

        it('correct credentials should result in 201 Created', (done: MochaDone): void => {
            request(server)
                .post('/token')
                .send({ nickname: savedData.nickname, password: savedData.password })
                .expect(201, done);
        });

        it('correct credentials should fetch valid JSON Web Token', (done: MochaDone): void => {
            request(server)
                .post('/token')
                .send({ nickname: savedData.nickname, password: savedData.password })
                .end((err: Error, res: request.Response): void => { validateJsonWebToken(err, res, done); });
        });
    });

    describe('PUT', () => {
        let token: Token;
        beforeEach((done: MochaDone): void => { token = new Token(savedData, done); });
        afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

        it('no token should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server).put('/token').expect(401, done);
        });

        it('tampered token token should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server).put('/token').set('Authorization', `Bearer ${token.tamperedToken}`).expect(401, done);
        });

        it('untampered token should result in 201 Created', (done: MochaDone): void => {
            request(server).put('/token').set('Authorization', `Bearer ${token.untamperedToken}`).expect(201, done);
        });

        it('untampered token should fetch valid JSON Web Token', (done: MochaDone): void => {
            request(server)
                .put('/token')
                .set('Authorization', `Bearer ${token.untamperedToken}`)
                .end((err: Error, res: request.Response): void => { validateJsonWebToken(err, res, done); });
        });

        it('blacklisted token should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server)
                .put('/token')
                .set('Authorization', `Bearer ${token.untamperedToken}`)
                .end((err: Error, res: request.Response) => {
                    if (err) {
                        return done(err);
                    }
                    request(server).put('/token').set('Authorization', `Bearer ${token.untamperedToken}`).expect(401, done);
                });
        });
    });

    describe('PATCH', () => {
        it('should result 404 Not Found', (done: MochaDone) => {
            request(server).patch('/token').expect(404, done);
        });
    });

    describe('delete', () => {
        let token: Token;
        beforeEach((done: MochaDone): void => { token = new Token(savedData, done); });
        afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

        it('no authorization token should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server).delete('/token').expect(401, done);
        });

        it('tampered authorization token should result in 401 Unauthorized', (done: MochaDone): void => {
            request(server).delete('/token').set('Authorization', `Bearer ${token.tamperedToken}`).expect(401, done);
        });

        it('untampered authorization should result in 200 OK', (done: MochaDone): void => {
            request(server).delete('/token').set('Authorization', `Bearer ${token.untamperedToken}`).expect(200, done);
        });
    });
});
