///<reference path="../typings/tsd.d.ts"/>
'use strict';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import {Server} from 'http';

import * as constants from './common/constants';
import {IHttpError} from './common/interfaces';
import * as routes from './routes';

let app: express.Express = express();

let port: number = process.env.PORT || 8080;

mongoose.connect(constants.mongo.databaseUrl);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes.setup(app);

app.use(function(err: IHttpError, req: express.Request, res: express.Response, next: Function): express.Response {
  if (err.status) {
    return res.status(err.status).json({ name: err.name, message: err.message, });
  } else {
    switch (err.name) {
      case 'ValidationError':
      case 'MongoError':
        return res.status(422).json({ name: err.name, message: err.message, });
      default:
        return res.status(500).json({ name: err.name, message: err.message, });
    }
  }
});

export let server: Server = app.listen(port);
