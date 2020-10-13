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
var channels = __importStar(require("./helpers/channels"));
var messages = __importStar(require("./helpers/messages"));
var errors_1 = __importStar(require("./errors"));
var TextileChat = /** @class */ (function () {
    function TextileChat(domain, textileSocketUrl, web3Provider) {
        this.activeContactListeners = [];
        this.textileSocketUrl = textileSocketUrl;
        this.domain = domain;
        this.contactsList = [];
        this.contactInvitesList = [];
        this.channelsList = [];
        this.channelInvitesList = [];
        this.provider = web3Provider;
        this.signer = this.provider.getSigner();
        this.emitter = new events_1.EventEmitter();
    }
    TextileChat.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var identity, domainPubKey, userAuth, _a, writeValidatorStr, e_1, e_2, e_3, mailboxId;
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
                        writeValidatorStr = "let ownerPub = '" + this.identity.public.toString() + "';\nif (writer === ownerPub) {\n  return true;\n}\nreturn false;\n";
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.client.newCollection(this.threadId, {
                                name: 'contacts',
                                schema: schemas_1.default.contacts,
                            })];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _b.sent();
                        console.log(e_1);
                        return [3 /*break*/, 10];
                    case 10:
                        _b.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.client.newCollection(this.threadId, {
                                name: 'channels',
                                schema: schemas_1.default.channels,
                            })];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        e_2 = _b.sent();
                        console.log(e_2);
                        return [3 /*break*/, 13];
                    case 13:
                        _b.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, this.client.newCollection(this.threadId, {
                                name: 'channelsIndex',
                                schema: schemas_1.default.channelsIndex,
                            })];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        e_3 = _b.sent();
                        console.log(e_3);
                        return [3 /*break*/, 16];
                    case 16: return [4 /*yield*/, this.users.getMailboxID().catch(function () { return null; })];
                    case 17:
                        mailboxId = _b.sent();
                        if (!!mailboxId) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.users.setupMailbox()];
                    case 18:
                        _b.sent();
                        _b.label = 19;
                    case 19: return [2 /*return*/];
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
                        contact = (_a.sent())[0];
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
            var q;
            var _this = this;
            return __generator(this, function (_a) {
                this.emitter.on('contact', cb);
                this.contactsList = [];
                q = new hub_1.Where("owner").eq(this.identity.public.toString());
                this.client.find(this.threadId, 'contacts', q).then(function (result) {
                    result.map(function (contact) {
                        _this.contactsList.push({ domain: contact.domain, id: contact._id });
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
                return [2 /*return*/, this.contactsList];
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
    TextileChat.prototype.getContactInvites = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, privateKey, _i, messages_1, message, body, _a, _b, _c, _d, mailboxID;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.users.listInboxMessages()];
                    case 1:
                        messages = _e.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        this.contactInvitesList = [];
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
                            this.contactInvitesList.push({ body: body, from: message.from, id: message.id });
                        }
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        contacts.handleAcceptedInvites({
                            identity: this.identity,
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
                                                identity: this.identity,
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
                        return [2 /*return*/, this.contactInvitesList];
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
                        return [4 /*yield*/, contacts.contactCreate(this.client, this.threadId, contactInviteMessage.body.domain, this.identity)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, contacts.sendInviteAccepted({
                                threadId: this.threadId,
                                users: this.users,
                                privateKey: privateKey,
                                dbInfo: dbInfo,
                                signer: this.signer,
                                contactInviteMessage: contactInviteMessage,
                                domain: this.domain,
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, messages.createContactIndex({
                                threadId: this.threadId,
                                contactPubKey: contactPubKey,
                                privateKey: privateKey,
                                client: this.client,
                                contactThreadId: contactInviteMessage.body.threadId,
                                contactDbInfo: contactInviteMessage.body.dbInfo,
                                identity: this.identity
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
    TextileChat.prototype.declineContactInvite = function (contactInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.deleteInboxMessage(contactInviteMessage.id)];
            });
        });
    };
    TextileChat.prototype.sendContactMessage = function (contactDomain, msg, index) {
        return __awaiter(this, void 0, void 0, function () {
            var contactPubKey, msgIndex, pubKey, message, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, helpers_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        contactPubKey = _b.sent();
                        return [4 /*yield*/, messages.getContactIndex({
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
                            _a.owner = this.identity.public.toString(),
                            _a.domain = '',
                            _a.id = '',
                            _a);
                        return [2 /*return*/, this.client.create(this.threadId, contactPubKey + '-' + index.toString(), [message])];
                }
            });
        });
    };
    TextileChat.prototype._loadContactMessages = function (contactPubKey, client, pubKey, threadId, decryptKey, name, index) {
        return __awaiter(this, void 0, void 0, function () {
            var messageList, collectionName, q, msgs, _i, msgs_1, msg, decryptedBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageList = [];
                        collectionName = contactPubKey + '-' + index.toString();
                        q = new hub_1.Where("owner").eq(pubKey);
                        return [4 /*yield*/, client.find(threadId, collectionName, q)];
                    case 1:
                        msgs = _a.sent();
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
                            domain: ''
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
    TextileChat.prototype._listenContactMessages = function (contactPubKey, client, pubKey, threadId, decryptKey, name, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionName;
            var _this = this;
            return __generator(this, function (_a) {
                collectionName = contactPubKey + '-' + index.toString();
                return [2 /*return*/, client.listen(threadId, [{ collectionName: collectionName }], function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        var decryptedBody, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!msg.instance || (msg.instance.owner !== pubKey)) {
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
                                        domain: ''
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
            var _i, _a, listener, _contactPubKey, _messagesIndex, _contactClient, e_4, contactThreadId, contactMessageIndex, privateKey, ownerDecryptKey, _b, readerDecryptKey, _c, messageList, owner, contact, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
                        return [4 /*yield*/, messages.getContactIndex({
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
                        e_4 = _p.sent();
                        if (e_4.message === 'db already exists') {
                            // ignore, probably using same textile id
                        }
                        else {
                            throw new errors_1.default(errors_1.ChatErrorCode.UnknownError, {
                                errorMessage: e_4.message,
                            });
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        contactThreadId = hub_1.ThreadID.fromString(_messagesIndex.threadId);
                        return [4 /*yield*/, messages.getContactIndex({
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
                            this.identity.public.toString(),
                            this.threadId,
                            ownerDecryptKey,
                            this.domain,
                            index,
                        ];
                        contact = [
                            this.identity.public.toString(),
                            _contactClient,
                            _contactPubKey,
                            contactThreadId,
                            readerDecryptKey,
                            contactDomain,
                            index,
                        ];
                        _e = (_d = messageList.push).apply;
                        _f = [messageList];
                        return [4 /*yield*/, this._loadContactMessages.apply(this, owner)];
                    case 11:
                        _e.apply(_d, _f.concat([(_p.sent())]));
                        _h = (_g = messageList.push).apply;
                        _j = [messageList];
                        return [4 /*yield*/, this._loadContactMessages.apply(this, contact)];
                    case 12:
                        _h.apply(_g, _j.concat([(_p.sent())]));
                        _l = (_k = this.activeContactListeners).push;
                        return [4 /*yield*/, this._listenContactMessages.apply(this, __spreadArrays(owner, [cb]))];
                    case 13:
                        _l.apply(_k, [_p.sent()]);
                        _o = (_m = this.activeContactListeners).push;
                        return [4 /*yield*/, this._listenContactMessages.apply(this, __spreadArrays(contact, [cb]))];
                    case 14:
                        _o.apply(_m, [_p.sent()]);
                        return [2 /*return*/, messageList];
                }
            });
        });
    };
    ;
    TextileChat.prototype.archiveContactMessages = function (contactDomain, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var contactPubKey, ownerMessagesIndex, contactClient, e_5, contactThreadId, contactMessageIndex, archive, ownQ, ownMsgs, contactQ, contactMsgs, buckets, bucketName, _a, root, threadID, file, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, helpers_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        contactPubKey = _b.sent();
                        return [4 /*yield*/, messages.getContactIndex({
                                client: this.client,
                                threadId: this.threadId,
                                pubKey: contactPubKey,
                            })];
                    case 2:
                        ownerMessagesIndex = _b.sent();
                        return [4 /*yield*/, hub_1.Client.withUserAuth(this.userAuth)];
                    case 3:
                        contactClient = _b.sent();
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, contactClient.joinFromInfo(JSON.parse(ownerMessagesIndex.dbInfo))];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_5 = _b.sent();
                        if (e_5.message === "db already exists") {
                        }
                        else {
                            throw new Error(e_5.message);
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        contactThreadId = hub_1.ThreadID.fromString(ownerMessagesIndex.threadId);
                        return [4 /*yield*/, messages.getContactIndex({
                                client: contactClient,
                                threadId: contactThreadId,
                                pubKey: this.identity.public.toString(),
                            })];
                    case 8:
                        contactMessageIndex = _b.sent();
                        archive = {
                            members: {},
                            msgs: []
                        };
                        archive.members[this.domain] = {
                            pubKey: this.identity.public.toString(),
                            ownerDecryptKey: ownerMessagesIndex.ownerDecryptKey,
                            readerDecryptKey: ownerMessagesIndex.readerDecryptKey,
                            threadId: this.threadId
                        };
                        archive.members[contactDomain] = {
                            pubKey: contactPubKey,
                            ownerDecryptKey: contactMessageIndex.ownerDecryptKey,
                            readerDecryptKey: contactMessageIndex.readerDecryptKey,
                            threadId: contactThreadId
                        };
                        ownQ = new hub_1.Where("owner").eq(this.identity.public.toString());
                        return [4 /*yield*/, this.client.find(this.threadId, contactPubKey + "-" + index.toString(), ownQ)];
                    case 9:
                        ownMsgs = (_b.sent());
                        contactQ = new hub_1.Where("owner").eq(contactPubKey);
                        return [4 /*yield*/, contactClient.find(contactThreadId, this.identity.public.toString() + "-" + index.toString(), contactQ)];
                    case 10:
                        contactMsgs = (_b.sent());
                        archive.msgs = __spreadArrays(ownMsgs, contactMsgs);
                        archive.msgs.sort(function (a, b) { return a.time - b.time; });
                        buckets = hub_1.Buckets.withUserAuth(this.userAuth);
                        bucketName = "chat-" + this.identity.public.toString() + "-" + contactPubKey + "-" + index.toString();
                        return [4 /*yield*/, buckets.getOrCreate(bucketName)];
                    case 11:
                        _a = _b.sent(), root = _a.root, threadID = _a.threadID;
                        file = { path: '/index.html', content: JSON.stringify(archive) };
                        return [4 /*yield*/, buckets.pushPath(root.key, 'index.html', file)];
                    case 12:
                        result = _b.sent();
                        console.log("ARCHIVE RESULT");
                        console.log(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    //CHANNELS
    TextileChat.prototype.createChannel = function (channelName) {
        return __awaiter(this, void 0, void 0, function () {
            var dbInfo, privateKey, encryptionWallet, ownerDecryptKey, createdIndex, indexId;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.getDBInfo(this.threadId)];
                    case 1:
                        dbInfo = _a.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        encryptionWallet = hub_1.PrivateKey.fromRandom();
                        return [4 /*yield*/, privateKey.public.encrypt(encryptionWallet.seed)];
                    case 2:
                        ownerDecryptKey = (_a.sent()).toString();
                        return [4 /*yield*/, this.client.create(this.threadId, "channelsIndex", [{
                                    name: channelName,
                                    owner: this.identity.public.toString(),
                                    threadId: this.threadId.toString(),
                                    dbInfo: JSON.stringify(dbInfo),
                                    encryptKey: encryptionWallet.public.toString()
                                }])];
                    case 3:
                        createdIndex = _a.sent();
                        console.log("CREATED CHANNEL INDEX");
                        console.log(createdIndex);
                        indexId = createdIndex[0];
                        this.client.find(this.threadId, "channel-" + indexId + "-members", {}).catch(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.client.newCollection(this.threadId, {
                                            name: "channel-" + indexId + "-members",
                                            schema: schemas_1.default.channelMembers,
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, this.client.create(this.threadId, "channel-" + indexId + "-members", [{
                                                    name: this.domain,
                                                    pubKey: this.identity.public.toString(),
                                                    decryptKey: ownerDecryptKey
                                                }])];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.client.newCollection(this.threadId, {
                                                name: "channel-" + indexId + "-0",
                                                schema: schemas_1.default.messages,
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, this.client
                                .create(this.threadId, "channels", [{
                                    name: channelName,
                                    indexId: indexId,
                                    owner: this.identity.public.toString(),
                                    threadId: this.threadId.toString(),
                                    dbInfo: JSON.stringify(dbInfo)
                                }])];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TextileChat.prototype.leaveChannel = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (channel) {
                    try {
                        this.client.delete(this.threadId, 'channels', [channel._id]);
                    }
                    catch (e) {
                        console.log("COULD NOT LEAVE CHANNEL");
                    }
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        });
    };
    TextileChat.prototype.getChannels = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var q;
            var _this = this;
            return __generator(this, function (_a) {
                this.emitter.on('channel', cb);
                this.channelsList = [];
                q = new hub_1.Where("owner").eq(this.identity.public.toString());
                this.client.find(this.threadId, 'channels', q).then(function (result) {
                    result.map(function (channel) {
                        _this.channelsList.push(channel);
                    });
                });
                this.client.listen(this.threadId, [{ collectionName: 'channels' }], function (channel) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (!(channel === null || channel === void 0 ? void 0 : channel.instance)) {
                            return [2 /*return*/];
                        }
                        this.emitter.emit('channel', channel.instance);
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/, this.channelsList];
            });
        });
    };
    TextileChat.prototype.sendChannelInvite = function (contactDomain, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, q, channelIndex, memberQ, member, privateKey, decryptKey, domainPubKey, recipient, sig, dbInfo, recDecryptKey, channelInviteMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.joinFromInfo(JSON.parse(channel.dbInfo))];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        q = new hub_1.Where('_id').eq(channel.indexId);
                        return [4 /*yield*/, this.client.find(hub_1.ThreadID.fromString(channel.threadId), 'channelsIndex', q)];
                    case 4:
                        channelIndex = (_b.sent())[0];
                        if (!channelIndex)
                            return [2 /*return*/];
                        memberQ = new hub_1.Where("pubKey").eq(this.identity.public.toString());
                        return [4 /*yield*/, this.client.find(hub_1.ThreadID.fromString(channel.threadId), "channel-" + channel.indexId + "-members", memberQ)];
                    case 5:
                        member = (_b.sent())[0];
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        return [4 /*yield*/, helpers_1.decrypt(privateKey, member.decryptKey)];
                    case 6:
                        decryptKey = _b.sent();
                        return [4 /*yield*/, helpers_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 7:
                        domainPubKey = _b.sent();
                        if (!domainPubKey) {
                            throw new errors_1.default(errors_1.ChatErrorCode.UnconfiguredDomain, {
                                domain: contactDomain,
                            });
                        }
                        recipient = hub_1.PublicKey.fromString(domainPubKey);
                        return [4 /*yield*/, helpers_1.encrypt(hub_1.PublicKey.fromString(this.identity.public.toString()), domainPubKey)];
                    case 8:
                        sig = _b.sent();
                        return [4 /*yield*/, this.client.getDBInfo(this.threadId)];
                    case 9:
                        dbInfo = _b.sent();
                        return [4 /*yield*/, recipient.encrypt(decryptKey)];
                    case 10:
                        recDecryptKey = (_b.sent()).toString();
                        console.log(recDecryptKey);
                        channelInviteMessage = {
                            type: 'ChannelInvite',
                            sig: sig,
                            domain: this.domain,
                            dbInfo: JSON.stringify(dbInfo),
                            decryptKey: recDecryptKey,
                            threadId: this.threadId.toString(),
                            channelName: channelIndex.name,
                            channelId: channelIndex._id,
                            channelOwner: channelIndex.owner
                        };
                        return [2 /*return*/, this.users.sendMessage(this.identity, recipient, new TextEncoder().encode(JSON.stringify(channelInviteMessage)))];
                }
            });
        });
    };
    TextileChat.prototype.getChannelInvites = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, privateKey, _i, messages_2, message, body, _a, _b, _c, _d, mailboxID;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.users.listInboxMessages()];
                    case 1:
                        messages = _e.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        this.channelInvitesList = [];
                        this.emitter.on('channelInvite', cb);
                        _i = 0, messages_2 = messages;
                        _e.label = 2;
                    case 2:
                        if (!(_i < messages_2.length)) return [3 /*break*/, 5];
                        message = messages_2[_i];
                        _b = (_a = JSON).parse;
                        _d = (_c = new TextDecoder()).decode;
                        return [4 /*yield*/, privateKey.decrypt(message.body)];
                    case 3:
                        body = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                        if (body.type === 'ChannelInvite') {
                            this.channelInvitesList.push({ body: body, from: message.from, id: message.id });
                        }
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        channels.handleAcceptedInvites({
                            identity: this.identity,
                            threadId: this.threadId,
                            signer: this.signer,
                            users: this.users,
                            client: this.client,
                        });
                        return [4 /*yield*/, this.users.getMailboxID()];
                    case 6:
                        mailboxID = _e.sent();
                        this.users.watchInbox(mailboxID, function (reply) { return __awaiter(_this, void 0, void 0, function () {
                            var message, body, _a, _b, _c, _d, channelInviteMessage, channelAcceptedMessage;
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
                                        if (body.type === 'ChannelInvite') {
                                            channelInviteMessage = {
                                                body: body,
                                                from: message.from,
                                                id: message.id,
                                            };
                                            this.emitter.emit('channelInvite', channelInviteMessage);
                                        }
                                        if (body.type === 'ChannelInviteAccepted') {
                                            channelAcceptedMessage = {
                                                body: body,
                                                from: message.from,
                                                id: message.id,
                                            };
                                            channels.handleAcceptedInvite({
                                                signer: this.signer,
                                                channelAcceptedMessage: channelAcceptedMessage,
                                                identity: this.identity,
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
                        return [2 /*return*/, this.channelInvitesList];
                }
            });
        });
    };
    TextileChat.prototype.acceptChannelInvite = function (channelInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var dbInfo, privateKey, e_6, e_7, threadId, q, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("ACCEPT CHANNEL INVITE");
                        return [4 /*yield*/, this.client.getDBInfo(this.threadId)];
                    case 1:
                        dbInfo = _a.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, channels.create(this.client, this.threadId, this.identity, channelInviteMessage.body)];
                    case 3:
                        _a.sent();
                        console.log("CREATED CHANNEL");
                        return [3 /*break*/, 5];
                    case 4:
                        e_6 = _a.sent();
                        console.log(e_6);
                        return [3 /*break*/, 5];
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.client.joinFromInfo(JSON.parse(channelInviteMessage.body.dbInfo))];
                    case 6:
                        _a.sent();
                        console.log("JOINED DB");
                        return [3 /*break*/, 8];
                    case 7:
                        e_7 = _a.sent();
                        console.log(e_7);
                        return [3 /*break*/, 8];
                    case 8:
                        threadId = hub_1.ThreadID.fromString(channelInviteMessage.body.threadId);
                        q = new hub_1.Where("pubKey").eq(this.identity.public.toString());
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.client.create(threadId, "channel-" + channelInviteMessage.body.channelId + "-members", [{
                                    name: this.domain,
                                    pubKey: this.identity.public.toString(),
                                    decryptKey: channelInviteMessage.body.decryptKey
                                }])];
                    case 10:
                        _a.sent();
                        console.log("CREATED MEMBER");
                        return [3 /*break*/, 12];
                    case 11:
                        e_8 = _a.sent();
                        console.log(e_8);
                        return [3 /*break*/, 12];
                    case 12: return [4 /*yield*/, channels.sendInviteAccepted({
                            threadId: this.threadId,
                            users: this.users,
                            privateKey: privateKey,
                            dbInfo: dbInfo,
                            signer: this.signer,
                            channelInviteMessage: channelInviteMessage,
                            domain: this.domain,
                        })];
                    case 13:
                        _a.sent();
                        console.log("SEND BACK ACCEPTED");
                        return [4 /*yield*/, this.users.deleteInboxMessage(channelInviteMessage.id)];
                    case 14:
                        _a.sent();
                        console.log("REMOVE INVITE MESSAGE");
                        return [2 /*return*/];
                }
            });
        });
    };
    TextileChat.prototype.declineChannelInvite = function (channelInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.deleteInboxMessage(channelInviteMessage.id)];
            });
        });
    };
    TextileChat.prototype.sendChannelMessage = function (channel, msg, index) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, q, channelIndex, pubKey, message, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.joinFromInfo(JSON.parse(channel.dbInfo))];
                    case 1:
                        _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        q = new hub_1.Where('_id').eq(channel.indexId);
                        return [4 /*yield*/, this.client.find(hub_1.ThreadID.fromString(channel.threadId), 'channelsIndex', q)];
                    case 4:
                        channelIndex = (_c.sent())[0];
                        if (!channelIndex)
                            return [2 /*return*/];
                        pubKey = hub_1.PublicKey.fromString(channelIndex.encryptKey);
                        _b = {
                            time: Date.now()
                        };
                        return [4 /*yield*/, helpers_1.encrypt(pubKey, msg)];
                    case 5:
                        message = (_b.body = _c.sent(),
                            _b.owner = this.identity.public.toString(),
                            _b.domain = this.domain,
                            _b.id = '',
                            _b);
                        return [2 /*return*/, this.client.create(hub_1.ThreadID.fromString(channel.threadId), "channel-" + channel.indexId + "-" + index.toString(), [message])];
                }
            });
        });
    };
    TextileChat.prototype._loadChannelMessages = function (channelIndex, decryptKey, index) {
        return __awaiter(this, void 0, void 0, function () {
            var messageList, collectionName, msgs, _i, msgs_2, msg, decryptedBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageList = [];
                        collectionName = 'channel-' + channelIndex._id + '-' + index.toString();
                        return [4 /*yield*/, this.client.find(hub_1.ThreadID.fromString(channelIndex.threadId), collectionName, {})];
                    case 1:
                        msgs = _a.sent();
                        _i = 0, msgs_2 = msgs;
                        _a.label = 2;
                    case 2:
                        if (!(_i < msgs_2.length)) return [3 /*break*/, 5];
                        msg = msgs_2[_i];
                        return [4 /*yield*/, helpers_1.decryptAndDecode(decryptKey, msg.body)];
                    case 3:
                        decryptedBody = _a.sent();
                        messageList.push({
                            body: decryptedBody,
                            time: msg.time,
                            owner: msg.owner,
                            domain: msg.domain,
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
    TextileChat.prototype._listenChannelMessages = function (channelIndex, decryptKey, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionName;
            var _this = this;
            return __generator(this, function (_a) {
                collectionName = 'channel-' + channelIndex._id + '-' + index.toString();
                return [2 /*return*/, this.client.listen(hub_1.ThreadID.fromString(channelIndex.threadId), [{ collectionName: collectionName }], function (msg) { return __awaiter(_this, void 0, void 0, function () {
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
                                        owner: msg.instance.owner,
                                        id: msg.instance._id,
                                        domain: msg.instance.domain
                                    };
                                    console.log(message);
                                    cb(message);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    TextileChat.prototype.loadChannelMessages = function (channel, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, listener, messageList, e_9, q, channelIndex, memberQ, member, privateKey, decryptKey, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (this.activeContactListeners) {
                            for (_i = 0, _a = this.activeContactListeners; _i < _a.length; _i++) {
                                listener = _a[_i];
                                listener.close();
                            }
                        }
                        this.activeContactListeners = [];
                        messageList = [];
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.joinFromInfo(JSON.parse(channel.dbInfo))];
                    case 2:
                        _h.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_9 = _h.sent();
                        console.log(e_9);
                        return [3 /*break*/, 4];
                    case 4:
                        q = new hub_1.Where('_id').eq(channel.indexId);
                        console.log(channel.indexId);
                        return [4 /*yield*/, this.client.find(hub_1.ThreadID.fromString(channel.threadId), 'channelsIndex', q)];
                    case 5:
                        channelIndex = (_h.sent())[0];
                        memberQ = new hub_1.Where("pubKey").eq(this.identity.public.toString());
                        return [4 /*yield*/, this.client.find(hub_1.ThreadID.fromString(channel.threadId), "channel-" + channel.indexId + "-members", memberQ)];
                    case 6:
                        member = (_h.sent())[0];
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        _b = hub_1.PrivateKey.bind;
                        return [4 /*yield*/, helpers_1.decrypt(privateKey, member.decryptKey)];
                    case 7:
                        decryptKey = new (_b.apply(hub_1.PrivateKey, [void 0, _h.sent()]))();
                        if (!(channelIndex && member)) return [3 /*break*/, 10];
                        _d = (_c = messageList.push).apply;
                        _e = [messageList];
                        return [4 /*yield*/, this._loadChannelMessages(channelIndex, decryptKey, index)];
                    case 8:
                        _d.apply(_c, _e.concat([(_h.sent())]));
                        _g = (_f = this.activeContactListeners).push;
                        return [4 /*yield*/, this._listenChannelMessages(channelIndex, decryptKey, index, cb)];
                    case 9:
                        _g.apply(_f, [_h.sent()]);
                        return [2 /*return*/, messageList];
                    case 10: return [2 /*return*/, []];
                }
            });
        });
    };
    ;
    return TextileChat;
}());
exports.default = TextileChat;
