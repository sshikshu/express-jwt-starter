///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../../dist/app.d.ts"/>
import * as request from 'supertest';

import * as data from '../data';
import {Mongo, Token} from '../utilities';

import {server} from '../../dist/app';
import {IUserData} from '../../dist/Users/interfaces';

describe('Route /user', () => {
  let savedData: IUserData = data.users[0];
  let userData: IUserData = data.users[1];
  let mgo: Mongo;
  before((done: MochaDone): void => { mgo = new Mongo(done); });
  after((done: MochaDone): void => { mgo.close(done); });

  describe('GET', () => {
    it('request generates response 404 Not Found', (done: MochaDone): void => {
      request(server).get('/user').expect(404, done);
    });
  });

  describe('POST', () => {
    beforeEach((done: MochaDone): void => { mgo.saveUser(savedData, done); });
    afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

    it('creating empty user response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server).post('/user').expect(422, done);
    });

    it('creating user without email generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          nickname: userData.nickname,
          password: userData.password
        })
        .expect(422, done);
    });

    it('creating user without name generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          nickname: userData.nickname,
          email: userData.email,
          password: userData.password
        })
        .expect(422, done);
    });

    it('creating user without nickname generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          email: userData.email,
          password: userData.password
        })
        .expect(422, done);
    });

    it('creating user without password generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          nickname: userData.nickname,
          email: userData.email,
        })
        .expect(422, done);
    });

    it('creating user with invalid email generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          name: userData.name,
          email: 'email',
          nickname: userData.nickname,
          password: userData.password,
        })
        .expect(422, done);
    });

    it('creating user with email, name, nickname and password generates response 202 Created', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send(userData)
        .expect(201, done);
    });

    it('creating user with duplicate email generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: data.users[0].email,
          name: userData.name,
          nickname: userData.nickname,
          password: userData.password
        })
        .expect(422, done);
    });

    it('creating user with a duplicate name generates response 201 Created', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: userData.email,
          name: data.users[0].name,
          nickname: userData.nickname,
          password: userData.password
        })
        .expect(201, done);
    });

    it('creating user with duplicate nickname generates response 422 Unprocessable Entity', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: userData.email,
          name: userData.name,
          nickname: data.users[0].nickname,
          password: userData.password
        })
        .expect(422, done);
    });

    it('creating user with a duplicate password generates response 201 Created', (done: MochaDone): void => {
      request(server)
        .post('/user')
        .send({
          email: userData.email,
          name: userData.name,
          nickname: userData.nickname,
          password: data.users[0].password
        })
        .expect(201, done);
    });
  });

  describe('PUT', () => {
    it('request generates response 404 Not Found', (done: MochaDone): void => {
      request(server)
        .put('/user')
        .expect(404, done);
    });
  });

  describe('PATCH', () => {
    it('updating user without authorization token generates response 401 Unauthorized', (done: MochaDone): void => {
      request(server)
        .patch('/user')
        .expect(401, done);
    });
    describe('using Authorization Token', () => {
      let token: Token;
      beforeEach((done: MochaDone): void => { token = new Token(savedData, done); });
      afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

      it('updating user\'s email with an invalid value generates response 422 Unprocessable Entity', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            email: 'email'
          })
          .expect(422, done);
      });

      it('updating user\'s email generates response 200 OK', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            email: userData.email
          })
          .expect(200, done);
      });

      it('updating user\'s nickname generates response 200', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            nickname: userData.nickname
          })
          .expect(200, done);
      });

      it('updating user\'s name generates response 200', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            name: userData.name
          })
          .expect(200, done);
      });

      it('updating user\'s password generates response 200', (done: MochaDone): void => {
        request(server)
          .patch('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .send({
            password: userData.password
          })
          .expect(200, done);
      });
    });

  });

  describe('DELETE', () => {
    it('unauthenticated request generates response 401 Unauthorized', (done: MochaDone): void => {
      request(server)
        .delete('/user')
        .expect(401, done);
    });

    describe('using Authorization Token', () => {
      let token: Token;
      beforeEach((done: MochaDone): void => { token = new Token(savedData, done); });
      afterEach((done: MochaDone): void => { mgo.removeAllUsers(done); });

      it('deleting a user causes 200', (done: MochaDone): void => {
        request(server)
          .delete('/user')
          .set('Authorization', `Bearer ${token.untamperedToken}`)
          .expect(200, done);
      });
    });
  });
});
