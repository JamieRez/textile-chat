"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.handleAcceptedInvites = exports.handleAcceptedInvite = exports.deleteChannels = exports.getChannels = exports.configure = exports.sendInviteAccepted = exports.declineInvite = exports.acceptInvite = void 0;
var hub_1 = require("@textile/hub");
var _1 = require(".");
var schemas_1 = __importDefault(require("./schemas"));
var errors_1 = __importStar(require("../errors"));
var CHANNEL_INDEX_LIMIT = 50;
var deleteChannels = function (client, threadId, channelIds) {
    return client.delete(threadId, 'channels', channelIds);
};
exports.deleteChannels = deleteChannels;
var deleteAllChannels = function (client, threadId) { return __awaiter(void 0, void 0, void 0, function () {
    var channels;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.find(threadId, 'channels', {})];
            case 1:
                channels = _a.sent();
                return [2 /*return*/, deleteChannels(client, threadId, channels.map(function (channel) { return channel._id; }))];
        }
    });
}); };
var getChannels = function (client, threadId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client.find(threadId, 'channels', {}).then(function (result) {
                return result.map(function (channel) {
                    return { domain: channel.domain, id: channel._id };
                });
            })];
    });
}); };
exports.getChannels = getChannels;
var sendInviteAccepted = function (_a) {
    var domain = _a.domain, channelInviteMessage = _a.channelInviteMessage, privateKey = _a.privateKey, users = _a.users, dbInfo = _a.dbInfo, threadId = _a.threadId;
    var body = {
        type: 'ChannelInviteAccepted',
        sig: channelInviteMessage.body.sig,
        domain: domain,
        dbInfo: JSON.stringify(dbInfo),
        threadId: threadId.toString(),
        channelName: channelInviteMessage.body.channelName,
        channelId: channelInviteMessage.body.channelId,
        channelOwner: channelInviteMessage.body.channelOwner,
        decryptKey: channelInviteMessage.body.decryptKey
    };
    var recipient = hub_1.PublicKey.fromString(channelInviteMessage.from);
    return users.sendMessage(privateKey, recipient, new TextEncoder().encode(JSON.stringify(body)));
};
exports.sendInviteAccepted = sendInviteAccepted;
var configure = function (_a) {
    var identity = _a.identity, threadId = _a.threadId, signer = _a.signer, users = _a.users, client = _a.client;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, client
                    .find(threadId, 'channels', {})
                    .catch(function () {
                    return client.newCollection(threadId, {
                        name: 'channels',
                        schema: schemas_1.default.channels,
                    });
                })
                    .then(function () {
                    return handleAcceptedInvites({
                        identity: identity,
                        threadId: threadId,
                        signer: signer,
                        users: users,
                        client: client,
                    });
                })];
        });
    });
};
exports.configure = configure;
var handleAcceptedInvites = function (_a) {
    var identity = _a.identity, threadId = _a.threadId, signer = _a.signer, users = _a.users, client = _a.client;
    return __awaiter(void 0, void 0, void 0, function () {
        var privateKey, messages, _i, messages_1, message, body, _b, _c, _d, _e, channelAcceptedMessage;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    privateKey = hub_1.PrivateKey.fromString(identity.toString());
                    return [4 /*yield*/, users.listInboxMessages()];
                case 1:
                    messages = _f.sent();
                    _i = 0, messages_1 = messages;
                    _f.label = 2;
                case 2:
                    if (!(_i < messages_1.length)) return [3 /*break*/, 6];
                    message = messages_1[_i];
                    _c = (_b = JSON).parse;
                    _e = (_d = new TextDecoder()).decode;
                    return [4 /*yield*/, privateKey.decrypt(message.body)];
                case 3:
                    body = _c.apply(_b, [_e.apply(_d, [_f.sent()])]);
                    if (!(body.type === 'ChannelInviteAccepted')) return [3 /*break*/, 5];
                    channelAcceptedMessage = {
                        body: body,
                        id: message.id,
                        from: message.from,
                    };
                    return [4 /*yield*/, handleAcceptedInvite({
                            channelAcceptedMessage: channelAcceptedMessage,
                            signer: signer,
                            threadId: threadId,
                            client: client,
                            identity: identity,
                            users: users,
                        })];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.handleAcceptedInvites = handleAcceptedInvites;
var handleAcceptedInvite = function (_a) {
    var signer = _a.signer, channelAcceptedMessage = _a.channelAcceptedMessage, client = _a.client, threadId = _a.threadId, users = _a.users, identity = _a.identity;
    return __awaiter(void 0, void 0, void 0, function () {
        var contactPubKey, privateKey, sig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _1.getAndVerifyDomainPubKey(signer.provider, channelAcceptedMessage.body.domain, channelAcceptedMessage.from)];
                case 1:
                    contactPubKey = _b.sent();
                    privateKey = hub_1.PrivateKey.fromString(identity.toString());
                    return [4 /*yield*/, _1.decryptAndDecode(privateKey, channelAcceptedMessage.body.sig)];
                case 2:
                    sig = _b.sent();
                    if (sig !== contactPubKey) {
                        throw new errors_1.default(errors_1.ChatErrorCode.InvalidSigature, {
                            signature: sig,
                            pubKey: identity.public.toString(),
                        });
                    }
                    return [4 /*yield*/, users.deleteInboxMessage(channelAcceptedMessage.id)];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.handleAcceptedInvite = handleAcceptedInvite;
var create = function (client, threadId, identity, channelAcceptedMessage) {
    return client
        .create(threadId, "channels", [{
            name: channelAcceptedMessage.channelName,
            indexId: channelAcceptedMessage.channelId,
            owner: identity.public.toString(),
            threadId: channelAcceptedMessage.threadId,
            dbInfo: channelAcceptedMessage.dbInfo
        }])
        .catch(function (e) {
        if (e.message === "can't create already existing instance") {
            // Contact already created - ignore error
        }
        else {
            throw new errors_1.default(errors_1.ChatErrorCode.UnknownError, {
                errorMessage: e.message,
            });
        }
    });
};
exports.create = create;
var acceptInvite = function (_a) {
    var domain = _a.domain, identity = _a.identity, privateKey = _a.privateKey, threadId = _a.threadId, signer = _a.signer, channelInviteMessage = _a.channelInviteMessage, users = _a.users, client = _a.client, dbInfo = _a.dbInfo;
    return __awaiter(void 0, void 0, void 0, function () {
        var contactPubKey;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _1.getAndVerifyDomainPubKey(signer.provider, channelInviteMessage.body.domain, channelInviteMessage.from)];
                case 1:
                    contactPubKey = _b.sent();
                    return [4 /*yield*/, create(client, threadId, identity, channelInviteMessage.body)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, sendInviteAccepted({
                            threadId: threadId,
                            users: users,
                            privateKey: privateKey,
                            dbInfo: dbInfo,
                            signer: signer,
                            channelInviteMessage: channelInviteMessage,
                            domain: domain,
                        })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, users.deleteInboxMessage(channelInviteMessage.id)];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.acceptInvite = acceptInvite;
var declineInvite = function (_a) {
    var channelInviteMessage = _a.channelInviteMessage, users = _a.users;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, users.deleteInboxMessage(channelInviteMessage.id)];
        });
    });
};
exports.declineInvite = declineInvite;
