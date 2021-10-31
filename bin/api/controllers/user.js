"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
var user_1 = __importDefault(require("@exmpl/api/services/user"));
var express_1 = require("@exmpl/utils/express");
function auth(req, res, next) {
    //parse our token from headers - guaranteed to be non-null
    var token = req.headers.authorization;
    user_1.default.auth(token)
        .then(function (authResponse) {
        if (!authResponse.error) {
            res.locals.auth = {
                userId: authResponse.userId
            };
            next();
        }
        else {
            (0, express_1.writeJsonResponse)(res, 401, authResponse);
        }
    })
        .catch(function (err) {
        // console.log(err)
        (0, express_1.writeJsonResponse)(res, 500, {
            error: {
                type: 'internal_server_error',
                message: 'Internal server error'
            }
        });
    });
}
exports.auth = auth;
