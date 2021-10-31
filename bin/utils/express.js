"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJsonResponse = void 0;
function writeJsonResponse(res, code, payload, headers) {
    var data = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload;
    res.writeHead(code, __assign(__assign({}, headers), { 'Content-Type': 'application/json' }));
    res.end(data);
}
exports.writeJsonResponse = writeJsonResponse;
