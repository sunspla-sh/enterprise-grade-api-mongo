"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function auth(bearerToken) {
    return new Promise(function (resolve, reject) {
        var token = bearerToken.replace('Bearer ', '');
        if (token === 'fakeToken') {
            resolve({
                userId: 'fakeUserId'
            });
        }
        resolve({
            error: {
                type: 'unauthorized',
                message: 'Authentication failed'
            }
        });
    });
}
exports.default = { auth: auth };
