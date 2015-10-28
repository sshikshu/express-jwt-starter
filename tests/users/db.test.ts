///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../../dist/app.d.ts"/>
import * as request from 'supertest';
import {assert} from 'chai';
import * as bcrypt from 'bcrypt';

import * as data from '../data';
import {IPartialUserData} from '../interfaces';
import {Mongo, Token} from '../utilities';

import {server} from '../../dist/app';
import {IUserData, IUserDocument} from '../../dist/Users/interfaces';


describe('Route /user', () => {
  let savedData: IUserData = data.users[0];
  let userData: IUserData = data.users[1];
  let mgo: Mongo;

  function checkDb(err: Error, identity: IPartialUserData, expected: number, done: MochaDone): void {
    if (err) {
      throw err;
    }
    mgo.mongo.collection('users').find(identity).count(false, (findErr: Error, count: number) => {
      if (findErr) {
        throw findErr;
      }
      assert.equal(count, expected);
      done();
    });
  }

  before((done: MochaDone) => { mgo = new Mongo(done); });
  after((done: MochaDone): void => { mgo.close(done); });

  describe('POST', () => {
    beforeEach((done: MochaDone): void => { mgo.saveUser(savedData, done); });
    afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

    it('creating empty user does not create empty entry in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({})
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: '' }, 0, done); });
    });

    it('creating user without email does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          nickname: userData.nickname,
          password: userData.password
        })
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: userData.nickname }, 0, done); });
    });

    it('creating user without name does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          nickname: userData.nickname,
          email: userData.email,
          password: userData.password
        })
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: userData.nickname }, 0, done); });
    });

    it('creating user without nickname does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          email: userData.email,
          password: userData.password
        })
        .end((err: Error, res: request.Response): void => { checkDb(err, { email: userData.email }, 0, done); });
    });

    it('creating user without password does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          nickname: userData.nickname,
          email: userData.email,
        })
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: userData.nickname }, 0, done); });
    });

    it('creating user with name, nickname, password and invalid email does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          email: 'email',
          nickname: userData.nickname,
          password: userData.password,
        })
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: userData.nickname }, 0, done); });
    });

    it('creating user with email, name, nickname and password creates object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send(userData)
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: userData.nickname }, 1, done); });
    });

    it('creating user with duplicate email does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: savedData.email,
          name: userData.name,
          nickname: userData.nickname,
          password: userData.password
        })
        .end((err: Error, res: request.Response): void => {
          checkDb(err, { nickname: userData.nickname, email: savedData.email }, 0, done);
        });
    });

    it('creating user with a duplicate name creates object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: userData.email,
          name: savedData.name,
          nickname: userData.nickname,
          password: userData.password
        })
        .end((err: Error, res: request.Response): void => {
          checkDb(err, { nickname: userData.nickname, name: savedData.name }, 1, done);
        });
    });

    it('creating user with duplicate nickname does not create object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: userData.email,
          name: userData.name,
          nickname: savedData.nickname,
          password: userData.password
        })
        .end((err: Error, res: request.Response): void => {
          checkDb(err, { email: userData.email, nickname: savedData.nickname }, 0, done);
        });
    });

    it('creating user with a duplicate password creates object in db', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: userData.email,
          name: userData.name,
          nickname: userData.nickname,
          password: savedData.password
        })
        .end((err: Error, res: request.Response): void => { checkDb(err, { nickname: userData.nickname }, 1, done); });
    });
  });

  describe('PATCH', () => {
    describe('using Authorization Token', () => {
      let token: Token;
      beforeEach((done: MochaDone): void => { token = new Token(savedData, done); });
      afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

      it('updating user\'s email with invalid value is not reflected in db', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            email: 'email'
          })
          .end((err: Error, res: request.Response): void => {
            checkDb(err, { nickname: savedData.nickname, email: 'email' }, 0, done);
          });
      });

      it('updating user\'s email is reflected in db', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            email: userData.email
          })
          .end((err: Error, res: request.Response): void => {
            checkDb(err, { nickname: savedData.nickname, email: userData.email }, 1, done);
          });
      });

      it('updating user\'s nickname is reflected in db', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            nickname: userData.nickname
          })
          .end((err: Error, res: request.Response): void => {
            checkDb(err, { nickname: userData.nickname, email: savedData.email }, 1, done);
          });
      });

      it('updating user\'s name is reflected in db', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            name: userData.name
          })
          .end((err: Error, res: request.Response): void => {
            checkDb(err, { nickname: savedData.nickname, name: userData.name }, 1, done);
          });
      });

      it('updating user\'s password generates response 200', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            password: userData.password
          })
          .end((err: Error, res: request.Response): void => {
            if (err) {
              throw err;
            }
            mgo.mongo.collection('users').findOne({ nickname: savedData.nickname }, (findErr: Error, user: IUserDocument): void => {
              if (findErr) {
                throw findErr;
              }
              bcrypt.compare(userData.password, user.password, (compareErr: Error, isMatch: boolean): void => {
                if (compareErr) {
                  throw compareErr;
                }
                if (isMatch) {
                  done();
                } else {
                  throw new Error('Password incorrectly Updated');
                }
              });
            });
          });
      });
    });

  });

  describe('DELETE', () => {
    describe('using Authorization Token', () => {
      let token: Token;
      beforeEach((done: MochaDone): void => { token = new Token(userData, done); });
      afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

      it('deleting a user causes 200', (done: MochaDone): void => {
        request(server)
          .delete('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .end((err: Error, res: request.Response): void => {
            checkDb(err, { nickname: userData.nickname }, 0, done);
          });
      });
    });
  });
});
