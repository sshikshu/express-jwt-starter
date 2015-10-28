import {IUserIdentity} from '../dist/Users/interfaces';

export interface IPartialUserData extends IUserIdentity {
    name?: string;
    password?: string;
}
