"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./utils/server");
var logger_1 = __importDefault(require("@exmpl/utils/logger"));
(0, server_1.createServer)()
    .then(function (server) {
    server.listen(3000, function () {
        logger_1.default.info("Listening on http://localhost:3000");
    });
})
    .catch(function (err) {
    logger_1.default.error("Error: " + err);
});
