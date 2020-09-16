"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHexString = exports.fromHexString = void 0;
var fromHexString = function (hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(function (byte) { return parseInt(byte, 16); }));
};
exports.fromHexString = fromHexString;
var toHexString = function (byteArray) {
    var s = "0x";
    byteArray.forEach(function (byte) {
        s += ("0" + (byte & 0xff).toString(16)).slice(-2);
    });
    return s;
};
exports.toHexString = toHexString;
