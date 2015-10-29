'use strict';

export namespace mongo {
  export const host: string = 'localhost';
  export const port: number = 27017;
  export const url: string = `mongodb://${host}:${port}`;
  export const database: string = 'test';
  export const databaseUrl: string = `${url}/${database}`;
}

export namespace redis {
  export const host: string = 'localhost';
  export const port: number = 6379;
}

export namespace smtp {
  export const preset: string = 'Gmail';
  export const id: string = 'id@gmail.com';
  export const password: string = 'password';
}

export namespace webtoken {
  export const audience: string = 'clients...?';
  export const expiresIn: number = 60 * 60 * 24;
  export const issuer: string = 'nullcorp';
  export const secret: string = 'keyboard cat';
}
