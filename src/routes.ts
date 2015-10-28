'use strict';
import * as express from 'express';

import * as Users from './Users';
import * as Token from './Token';

export function setup(app: express.Express): void {
  let userRoutes: express.Router = express.Router();
  Users.setup(userRoutes);
  app.use('/user', userRoutes);

  let tokenRoutes: express.Router = express.Router();
  Token.setup(tokenRoutes);
  app.use('/token', tokenRoutes);

  let apiRoutes: express.Router = express.Router();
  app.use('/api', apiRoutes);
}
