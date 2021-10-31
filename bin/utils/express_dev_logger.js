"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressDevLogger = void 0;
var logger_1 = __importDefault(require("@exmpl/utils/logger"));
var expressDevLogger = function (req, res, next) {
    //in nanoseconds
    var startHrTime = process.hrtime.bigint();
    logger_1.default.http("Request: " + req.method + " " + req.url + " at " + new Date().toUTCString() + ", User-Agent: " + req.get('User-Agent'));
    logger_1.default.http("Request Body: " + JSON.stringify(req.body));
    var _a = [res.write, res.end], oldWrite = _a[0], oldEnd = _a[1];
    var chunks = [];
    res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
    };
    res.end = function (chunk) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        //in nanoseconds
        var endHrTime = process.hrtime.bigint();
        //calculate difference and convert to milliseconds
        var elapsedTimeInMs = Number(endHrTime - startHrTime) / 1e6;
        logger_1.default.http("Response " + res.statusCode + " " + elapsedTimeInMs.toFixed(3) + " ms");
        var body = Buffer.concat(chunks).toString('utf-8');
        logger_1.default.http("Response Body: " + body);
        oldEnd.apply(res, arguments);
    };
    next();
};
exports.expressDevLogger = expressDevLogger;
