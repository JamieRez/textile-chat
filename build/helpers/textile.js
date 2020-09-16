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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainPubKey = exports.getAndVerifyDomainPubKey = exports.auth = exports.configureDomain = exports.getIdentity = exports.findOrCreateCollection = exports.decryptAndDecode = exports.decrypt = exports.encrypt = void 0;
var ethers_1 = require("ethers");
var hub_1 = require("@textile/hub");
var _1 = require(".");
var _2 = require(".");
var getIdentityFromSignature = function (signature) {
    var hex = Buffer.from(signature, "utf8");
    var privateKey = ethers_1.ethers.utils.sha256(hex).replace("0x", "");
    return new hub_1.PrivateKey(_2.fromHexString(privateKey));
};
var loginWithChallenge = function (domain, signer, id) {
    return new Promise(function (resolve, reject) {
        var socketUrl = "ws://localhost:8080/ws/textile-auth";
        var socket = new WebSocket(socketUrl);
        socket.onopen = function () {
            socket.send(JSON.stringify({
                domain: domain,
                pubkey: id.public.toString(),
                type: "token",
            }));
            socket.onmessage = function (event) { return __awaiter(void 0, void 0, void 0, function () {
                var data, _a, buf, signed;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            data = JSON.parse(event.data);
                            _a = data.type;
                            switch (_a) {
                                case "error": return [3 /*break*/, 1];
                                case "challenge": return [3 /*break*/, 2];
                                case "token": return [3 /*break*/, 4];
                            }
                            return [3 /*break*/, 5];
                        case 1:
                            {
                                reject(data.value);
                                return [3 /*break*/, 5];
                            }
                            _b.label = 2;
                        case 2:
                            buf = Buffer.from(data.value);
                            return [4 /*yield*/, id.sign(buf)];
                        case 3:
                            signed = _b.sent();
                            socket.send(JSON.stringify({
                                type: "challenge",
                                sig: Buffer.from(signed).toJSON(),
                            }));
                            return [3 /*break*/, 5];
                        case 4:
                            {
                                resolve(__assign(__assign({}, data.value), { key: "bk44oyenlgauefar67jn56p7edm" }));
                                return [3 /*break*/, 5];
                            }
                            _b.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
        };
    });
};
var getIdentity = function (signer) { return __awaiter(void 0, void 0, void 0, function () {
    var identificationSignature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, signer.signMessage("*****ONLY SIGN ON TRUSTED APPS*****: By signing this message you will create your Textile identification used for decentralized chat on ThreadsDB")];
            case 1:
                identificationSignature = _a.sent();
                return [2 /*return*/, getIdentityFromSignature(identificationSignature)];
        }
    });
}); };
exports.getIdentity = getIdentity;
var configureDomain = function (textileId, domain, signer) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, _1.setRecord(signer, domain, {
                key: "social.textile.pubkey",
                value: textileId.public.toString(),
            })];
    });
}); };
exports.configureDomain = configureDomain;
var getDomainPubKey = function (provider, domain) {
    return _1.getRecord(provider, domain, "social.textile.pubkey");
};
exports.getDomainPubKey = getDomainPubKey;
var getAndVerifyDomainPubKey = function (provider, domain, pubKey) { return __awaiter(void 0, void 0, void 0, function () {
    var domainPubKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getDomainPubKey(provider, domain)];
            case 1:
                domainPubKey = _a.sent();
                if (!domainPubKey) {
                    throw new Error("Domain does not have chat configured");
                }
                if (domainPubKey !== pubKey) {
                    throw new Error("Message does not match domain pubkey");
                }
                return [2 /*return*/, domainPubKey];
        }
    });
}); };
exports.getAndVerifyDomainPubKey = getAndVerifyDomainPubKey;
var auth = function (textileId, domain, signer) { return __awaiter(void 0, void 0, void 0, function () {
    var userAuth;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loginWithChallenge(domain, signer, textileId)];
            case 1:
                userAuth = _a.sent();
                return [2 /*return*/, userAuth];
        }
    });
}); };
exports.auth = auth;
var findOrCreateCollection = function (_a) {
    var threadId = _a.threadId, client = _a.client, collectionName = _a.collectionName, schema = _a.schema, query = _a.query;
    return client.find(threadId, collectionName, query || {}).catch(function (e) {
        return client.newCollection(threadId, collectionName, schema);
    });
};
exports.findOrCreateCollection = findOrCreateCollection;
var decryptAndDecode = function (identity, message) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = new TextDecoder()).decode;
                return [4 /*yield*/, identity.decrypt(Uint8Array.from(message.split(",").map(Number)))];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
        }
    });
}); };
exports.decryptAndDecode = decryptAndDecode;
var encrypt = function (pubKey, message) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pubKey.encrypt(new TextEncoder().encode(message))];
            case 1: return [2 /*return*/, (_a.sent()).toString()];
        }
    });
}); };
exports.encrypt = encrypt;
var decrypt = function (identity, message) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, identity.decrypt(Uint8Array.from(message.split(",").map(Number)))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.decrypt = decrypt;
