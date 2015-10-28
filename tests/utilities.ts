///<reference path="../typings/tsd.d.ts"/>
///<reference path="../dist/app.d.ts"/>
import {Db, MongoClient} from 'mongodb';

import {User} from '../dist/Users/models';
import {IUserData} from '../dist/Users/interfaces';
import * as utilities from '../dist/common/utilities';
import * as constants from '../dist/common/constants';


export class Mongo {
    private _mgo: Db;

    constructor(done: MochaDone) {
        MongoClient.connect(constants.mongo.databaseUrl, (err: Error, db: Db) => {
            if (err) {
                done(err);
            }
            this._mgo = db;
            done();
        });
    }

    public close(done: MochaDone): void {
        this._mgo.close();
        done();
    }

    public saveUser(userdata: IUserData, done: MochaDone): void {
        let user: User = new User(userdata);
        user.save().then(() => { done(); }).catch(done);
    }

    public removeAllUsers(done: MochaDone): void {
        this._mgo.collection('users').deleteMany({}, done);
    }

    get mongo(): Db {
        return this._mgo;
    }
}

export class Token {
    private _token: string;
    private _tamperedToken: string;
    constructor(userdata: IUserData, done: MochaDone) {
        let user: User = new User(userdata);
        user.save().then((savedUser: User) => {
            this._token = utilities.webtoken.create(user.id);
            let charToBeReplaced: string = this._token[0];
            let charToReplacedWith: string = charToBeReplaced === 'a' ? 'b' : 'a';
            this._tamperedToken = this._token.replace(charToBeReplaced, charToReplacedWith);
            done();
        }).catch(done);
    }

    get untamperedToken(): string {
        return this._token;
    };

    get tamperedToken(): string {
        return this._tamperedToken;
    }
}
