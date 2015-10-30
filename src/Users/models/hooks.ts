'use strict';
import * as bcrypt from 'bcrypt';
import * as uuid from 'node-uuid';


export function validateEmail(email: string): boolean {
  let re: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};


export function saltPassword(next: Function): void {
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, (saltErr: Error, salt: string) => {
      if (saltErr) {
        return next(saltErr);
      }
      bcrypt.hash(this.password, salt, (encryptErr: Error, hash: string): void => {
        if (encryptErr) {
          return next(encryptErr);
        }
        this.password = hash;
        return next();
      });
    });
  } else {
    return next();
  }
}

export function setEmailValidationToken(next: Function): void {
  if (this.isNew) {
    this.validation.email.sent = uuid.v4();
  }
  return next();
}
