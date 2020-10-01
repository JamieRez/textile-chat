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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hub_1 = require("@textile/hub");
var events_1 = require("events");
var schemas_1 = __importDefault(require("./helpers/schemas"));
var helpers_1 = require("./helpers");
var contacts = __importStar(require("./helpers/contacts"));
var messages = __importStar(require("./helpers/messages"));
var errors_1 = __importStar(require("./errors"));
var TextileChat = /** @class */ (function () {
    function TextileChat(domain, textileSocketUrl, web3Provider) {
        this.activeContactListeners = [];
        this.textileSocketUrl = textileSocketUrl;
        this.domain = domain;
        this.contactsList = [];
        this.contactInvitesList = [];
        this.provider = web3Provider;
        this.signer = this.provider.getSigner();
        this.emitter = new events_1.EventEmitter();
    }
    TextileChat.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var identity, domainPubKey, userAuth, _a, mailboxId;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, helpers_1.getIdentity(this.signer)];
                    case 1:
                        identity = _b.sent();
                        return [4 /*yield*/, helpers_1.getDomainPubKey(this.provider, this.domain)];
                    case 2:
                        domainPubKey = _b.sent();
                        if (!domainPubKey) {
                            throw new errors_1.default(errors_1.ChatErrorCode.UnconfiguredDomain, {
                                domain: this.domain,
                            });
                        }
                        if (identity.public.toString() !== domainPubKey) {
                            throw new errors_1.default(errors_1.ChatErrorCode.InvalidPubKey, {
                                domain: this.domain,
                                pubKey: domainPubKey,
                                expected: identity.public.toString(),
                            });
                        }
                        return [4 /*yield*/, helpers_1.auth(this.textileSocketUrl, identity, this.domain, this.signer)];
                    case 3:
                        userAuth = _b.sent();
                        this.identity = identity;
                        this.userAuth = userAuth;
                        this.client = hub_1.Client.withUserAuth(userAuth);
                        this.users = hub_1.Users.withUserAuth(userAuth);
                        return [4 /*yield*/, this.users.getToken(identity)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.client.getToken(identity)];
                    case 5:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, helpers_1.getChatThreadId(this.users, this.client)];
                    case 6:
                        _a.threadId = _b.sent();
                        this.client.find(this.threadId, 'contacts', {}).catch(function () {
                            return _this.client.newCollection(_this.threadId, 'contacts', schemas_1.default.contacts);
                        });
                        return [4 /*yield*/, this.users.getMailboxID().catch(function () { return null; })];
                    case 7:
                        mailboxId = _b.sent();
                        if (!!mailboxId) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.users.setupMailbox()];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    TextileChat.prototype.deleteContact = function (contactDomain) {
        return __awaiter(this, void 0, void 0, function () {
            var q, contact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q = new hub_1.Where('domain').eq(contactDomain);
                        return [4 /*yield*/, this.client.find(this.threadId, 'contacts', q)];
                    case 1:
                        contact = (_a.sent())
                            .instancesList[0];
                        if (contact) {
                            return [2 /*return*/, this.client.delete(this.threadId, 'contacts', [contact._id])];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TextileChat.prototype.getContacts = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var contacts;
            var _this = this;
            return __generator(this, function (_a) {
                this.emitter.on('contact', cb);
                contacts = [];
                this.client.find(this.threadId, 'contacts', {}).then(function (result) {
                    result.instancesList.map(function (contact) {
                        contacts.push({ domain: contact.domain, id: contact._id });
                    });
                });
                this.client.listen(this.threadId, [{ collectionName: 'contacts' }], function (contact) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (!(contact === null || contact === void 0 ? void 0 : contact.instance)) {
                            return [2 /*return*/];
                        }
                        this.emitter.emit('contact', {
                            domain: contact.instance.domain,
                            id: contact.instance._id,
                        });
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/, contacts];
            });
        });
    };
    TextileChat.prototype.sendContactInvite = function (contactDomain) {
        return __awaiter(this, void 0, void 0, function () {
            var domainPubKey, recipient, sig, dbInfo, contactInviteMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        domainPubKey = _a.sent();
                        if (!domainPubKey) {
                            throw new errors_1.default(errors_1.ChatErrorCode.UnconfiguredDomain, {
                                domain: contactDomain,
                            });
                        }
                        recipient = hub_1.PublicKey.fromString(domainPubKey);
                        return [4 /*yield*/, helpers_1.encrypt(hub_1.PublicKey.fromString(this.identity.public.toString()), domainPubKey)];
                    case 2:
                        sig = _a.sent();
                        return [4 /*yield*/, this.client.getDBInfo(this.threadId)];
                    case 3:
                        dbInfo = _a.sent();
                        contactInviteMessage = {
                            type: 'ContactInvite',
                            sig: sig,
                            domain: this.domain,
                            dbInfo: JSON.stringify(dbInfo),
                            threadId: this.threadId.toString(),
                        };
                        return [2 /*return*/, this.users.sendMessage(this.identity, recipient, new TextEncoder().encode(JSON.stringify(contactInviteMessage)))];
                }
            });
        });
    };
    TextileChat.prototype.getInvites = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, privateKey, contactInvites, _i, messages_1, message, body, _a, _b, _c, _d, mailboxID;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.users.listInboxMessages()];
                    case 1:
                        messages = _e.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        contactInvites = [];
                        this.emitter.on('contactInvite', cb);
                        _i = 0, messages_1 = messages;
                        _e.label = 2;
                    case 2:
                        if (!(_i < messages_1.length)) return [3 /*break*/, 5];
                        message = messages_1[_i];
                        _b = (_a = JSON).parse;
                        _d = (_c = new TextDecoder()).decode;
                        return [4 /*yield*/, privateKey.decrypt(message.body)];
                    case 3:
                        body = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                        if (body.type === 'ContactInvite') {
                            contactInvites.push({ body: body, from: message.from, id: message.id });
                        }
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        contacts.handleAcceptedInvites({
                            identity: privateKey,
                            threadId: this.threadId,
                            signer: this.signer,
                            users: this.users,
                            client: this.client,
                        });
                        return [4 /*yield*/, this.users.getMailboxID()];
                    case 6:
                        mailboxID = _e.sent();
                        this.users.watchInbox(mailboxID, function (reply) { return __awaiter(_this, void 0, void 0, function () {
                            var message, body, _a, _b, _c, _d, contactInviteMessage, contactAcceptedMessage;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        if (!(reply && reply.message)) return [3 /*break*/, 2];
                                        message = reply.message;
                                        _b = (_a = JSON).parse;
                                        _d = (_c = new TextDecoder()).decode;
                                        return [4 /*yield*/, privateKey.decrypt(message.body)];
                                    case 1:
                                        body = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                                        if (body.type === 'ContactInvite') {
                                            contactInviteMessage = {
                                                body: body,
                                                from: message.from,
                                                id: message.id,
                                            };
                                            this.emitter.emit('contactInvite', contactInviteMessage);
                                        }
                                        if (body.type === 'ContactInviteAccepted') {
                                            contactAcceptedMessage = {
                                                body: body,
                                                from: message.from,
                                                id: message.id,
                                            };
                                            contacts.handleAcceptedInvite({
                                                signer: this.signer,
                                                contactAcceptedMessage: contactAcceptedMessage,
                                                identity: privateKey,
                                                client: this.client,
                                                threadId: this.threadId,
                                                users: this.users,
                                            });
                                        }
                                        _e.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/, contactInvites];
                }
            });
        });
    };
    TextileChat.prototype.acceptContactInvite = function (contactInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var contactPubKey, dbInfo, privateKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.getAndVerifyDomainPubKey(this.signer.provider, contactInviteMessage.body.domain, contactInviteMessage.from)];
                    case 1:
                        contactPubKey = _a.sent();
                        return [4 /*yield*/, this.client.getDBInfo(this.threadId)];
                    case 2:
                        dbInfo = _a.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        return [4 /*yield*/, contacts.contactCreate(this.client, this.threadId, contactInviteMessage.body.domain)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, contacts.sendInviteAccepted({
                                threadId: this.threadId,
                                users: this.users,
                                identity: privateKey,
                                dbInfo: dbInfo,
                                signer: this.signer,
                                contactInviteMessage: contactInviteMessage,
                                domain: this.domain,
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, messages.createIndex({
                                threadId: this.threadId,
                                contactPubKey: contactPubKey,
                                identity: privateKey,
                                client: this.client,
                                contactThreadId: contactInviteMessage.body.threadId,
                                contactDbInfo: contactInviteMessage.body.dbInfo,
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.users.deleteInboxMessage(contactInviteMessage.id)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TextileChat.prototype.declineInvite = function (contactInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.deleteInboxMessage(contactInviteMessage.id)];
            });
        });
    };
    TextileChat.prototype.sendMessage = function (contactDomain, msg, index) {
        return __awaiter(this, void 0, void 0, function () {
            var contactPubKey, msgIndex, pubKey, message, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, helpers_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        contactPubKey = _b.sent();
                        return [4 /*yield*/, messages.getIndex({
                                client: this.client,
                                threadId: this.threadId,
                                pubKey: contactPubKey,
                            })];
                    case 2:
                        msgIndex = _b.sent();
                        pubKey = hub_1.PublicKey.fromString(msgIndex.encryptKey);
                        _a = {
                            time: Date.now()
                        };
                        return [4 /*yield*/, helpers_1.encrypt(pubKey, msg)];
                    case 3:
                        message = (_a.body = _b.sent(),
                            _a.owner = '',
                            _a.id = '',
                            _a);
                        return [2 /*return*/, this.client.create(this.threadId, contactPubKey + '-' + index.toString(), [message])];
                }
            });
        });
    };
    TextileChat.prototype.loadMessages = function (pubKey, client, threadId, decryptKey, name, index) {
        return __awaiter(this, void 0, void 0, function () {
            var messageList, collectionName, msgs, _i, msgs_1, msg, decryptedBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageList = [];
                        collectionName = pubKey + '-' + index.toString();
                        return [4 /*yield*/, client.find(threadId, collectionName, {})];
                    case 1:
                        msgs = (_a.sent())
                            .instancesList;
                        _i = 0, msgs_1 = msgs;
                        _a.label = 2;
                    case 2:
                        if (!(_i < msgs_1.length)) return [3 /*break*/, 5];
                        msg = msgs_1[_i];
                        return [4 /*yield*/, helpers_1.decryptAndDecode(decryptKey, msg.body)];
                    case 3:
                        decryptedBody = _a.sent();
                        messageList.push({
                            body: decryptedBody,
                            time: msg.time,
                            owner: name,
                            id: msg._id,
                        });
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        messageList.sort(function (a, b) { return a.time - b.time; });
                        return [2 /*return*/, messageList];
                }
            });
        });
    };
    TextileChat.prototype.listenMessages = function (pubKey, client, threadId, decryptKey, name, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionName;
            var _this = this;
            return __generator(this, function (_a) {
                collectionName = pubKey + '-' + index.toString();
                return [2 /*return*/, client.listen(threadId, [{ collectionName: collectionName }], function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        var decryptedBody, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!msg.instance) {
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, helpers_1.decryptAndDecode(decryptKey, msg.instance.body)];
                                case 1:
                                    decryptedBody = _a.sent();
                                    message = {
                                        body: decryptedBody,
                                        time: msg.instance.time,
                                        owner: name,
                                        id: msg._id,
                                    };
                                    cb(message);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    TextileChat.prototype.loadContactMessages = function (contactDomain, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, listener, _contactPubKey, _messagesIndex, _contactClient, e_1, contactThreadId, contactMessageIndex, privateKey, ownerDecryptKey, _b, readerDecryptKey, _c, messageList, owner, contact, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        if (this.activeContactListeners) {
                            for (_i = 0, _a = this.activeContactListeners; _i < _a.length; _i++) {
                                listener = _a[_i];
                                listener.close();
                            }
                        }
                        this.activeContactListeners = [];
                        return [4 /*yield*/, helpers_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        _contactPubKey = _p.sent();
                        return [4 /*yield*/, messages.getIndex({
                                client: this.client,
                                threadId: this.threadId,
                                pubKey: _contactPubKey,
                            })];
                    case 2:
                        _messagesIndex = _p.sent();
                        return [4 /*yield*/, hub_1.Client.withUserAuth(this.userAuth)];
                    case 3:
                        _contactClient = _p.sent();
                        _p.label = 4;
                    case 4:
                        _p.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, _contactClient.joinFromInfo(JSON.parse(_messagesIndex.dbInfo))];
                    case 5:
                        _p.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _p.sent();
                        if (e_1.message === 'db already exists') {
                            // ignore, probably using same textile id
                        }
                        else {
                            throw new errors_1.default(errors_1.ChatErrorCode.UnknownError, {
                                errorMessage: e_1.message,
                            });
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        contactThreadId = hub_1.ThreadID.fromString(_messagesIndex.threadId);
                        return [4 /*yield*/, messages.getIndex({
                                client: _contactClient,
                                threadId: contactThreadId,
                                pubKey: this.identity.public.toString(),
                            })];
                    case 8:
                        contactMessageIndex = _p.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        _b = hub_1.PrivateKey.bind;
                        return [4 /*yield*/, helpers_1.decrypt(privateKey, _messagesIndex.ownerDecryptKey)];
                    case 9:
                        ownerDecryptKey = new (_b.apply(hub_1.PrivateKey, [void 0, _p.sent()]))();
                        _c = hub_1.PrivateKey.bind;
                        return [4 /*yield*/, helpers_1.decrypt(privateKey, contactMessageIndex.readerDecryptKey)];
                    case 10:
                        readerDecryptKey = new (_c.apply(hub_1.PrivateKey, [void 0, _p.sent()]))();
                        messageList = [];
                        owner = [
                            _contactPubKey,
                            this.client,
                            this.threadId,
                            ownerDecryptKey,
                            this.domain,
                            index,
                        ];
                        contact = [
                            this.identity.public.toString(),
                            _contactClient,
                            contactThreadId,
                            readerDecryptKey,
                            contactDomain,
                            index,
                        ];
                        _e = (_d = messageList.push).apply;
                        _f = [messageList];
                        return [4 /*yield*/, this.loadMessages.apply(this, owner)];
                    case 11:
                        _e.apply(_d, _f.concat([(_p.sent())]));
                        _h = (_g = messageList.push).apply;
                        _j = [messageList];
                        return [4 /*yield*/, this.loadMessages.apply(this, contact)];
                    case 12:
                        _h.apply(_g, _j.concat([(_p.sent())]));
                        _l = (_k = this.activeContactListeners).push;
                        return [4 /*yield*/, this.listenMessages.apply(this, __spreadArrays(owner, [cb]))];
                    case 13:
                        _l.apply(_k, [_p.sent()]);
                        _o = (_m = this.activeContactListeners).push;
                        return [4 /*yield*/, this.listenMessages.apply(this, __spreadArrays(contact, [cb]))];
                    case 14:
                        _o.apply(_m, [_p.sent()]);
                        return [2 /*return*/, messageList];
                }
            });
        });
    };
    return TextileChat;
}());
exports.default = TextileChat;
