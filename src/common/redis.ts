'use strict';
import * as redis from 'redis';

import * as constants from './constants';


let client: redis.RedisClient = redis.createClient(constants.redis.port, constants.redis.host, null);

client.on('error', (err: Error): void => {
    if (err) {
        throw err;
    }
});

client.on('connect', (err: Error): void => {
    if (err) {
        throw err;
    }
});

export let redisClient: redis.RedisClient = client;
