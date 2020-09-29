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
var hub_1 = require("@textile/hub");
var ethers_1 = __importDefault(require("ethers"));
var events_1 = require("events");
var schemas_1 = __importDefault(require("./helpers/schemas"));
var index_1 = require("./helpers/index");
var contacts = __importStar(require("./helpers/contacts"));
var messages = __importStar(require("./helpers/messages"));
var TextileChat = /** @class */ (function () {
    function TextileChat() {
        this.domain = '';
        this.contactsList = [];
        this.contactInvitesList = [];
    }
    TextileChat.prototype.join = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var provider, signer, identity, domainPubKey, userAuth, client_1, users, threadId_1, thread, _a, mailboxId;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    this.domain = domain;
                                    if (!window.ethereum) {
                                        return [2 /*return*/, window.alert("Unable to detect a web3 wallet. Visit https://metamask.io/ to download a web3 compatible wallet.")];
                                    }
                                    provider = new ethers_1.default.providers.Web3Provider(window.ethereum);
                                    return [4 /*yield*/, window.ethereum.enable()];
                                case 1:
                                    _b.sent();
                                    signer = provider.getSigner();
                                    return [4 /*yield*/, index_1.getIdentity(signer)];
                                case 2:
                                    identity = _b.sent();
                                    return [4 /*yield*/, index_1.getDomainPubKey(signer.provider, this.domain)];
                                case 3:
                                    domainPubKey = _b.sent();
                                    if (!!domainPubKey) return [3 /*break*/, 5];
                                    return [4 /*yield*/, index_1.configureDomain(identity, this.domain, signer)];
                                case 4:
                                    _b.sent();
                                    return [3 /*break*/, 19];
                                case 5:
                                    if (!(identity.public.toString() === domainPubKey)) return [3 /*break*/, 18];
                                    return [4 /*yield*/, index_1.auth(identity, this.domain, signer)];
                                case 6:
                                    userAuth = _b.sent();
                                    client_1 = hub_1.Client.withUserAuth(userAuth);
                                    users = hub_1.Users.withUserAuth(userAuth);
                                    return [4 /*yield*/, users.getToken(identity)];
                                case 7:
                                    _b.sent();
                                    return [4 /*yield*/, client_1.getToken(identity)];
                                case 8:
                                    _b.sent();
                                    threadId_1 = hub_1.ThreadID.fromRandom();
                                    _b.label = 9;
                                case 9:
                                    _b.trys.push([9, 11, , 13]);
                                    return [4 /*yield*/, users.getThread("unstoppable-chat")];
                                case 10:
                                    thread = _b.sent();
                                    if (thread) {
                                        threadId_1 = thread.id;
                                    }
                                    return [3 /*break*/, 13];
                                case 11:
                                    _a = _b.sent();
                                    return [4 /*yield*/, client_1.newDB(threadId_1, "unstoppable-chat")];
                                case 12:
                                    threadId_1 = _b.sent();
                                    return [3 /*break*/, 13];
                                case 13:
                                    this.identity = identity;
                                    this.userAuth = userAuth;
                                    this.signer = signer;
                                    this.threadId = threadId_1;
                                    this.client = client_1;
                                    this.users = users;
                                    return [4 /*yield*/, client_1.deleteCollection(threadId_1, 'contacts')];
                                case 14:
                                    _b.sent();
                                    client_1
                                        .find(threadId_1, "contacts", {})
                                        .catch(function () {
                                        return client_1.newCollection(threadId_1, {
                                            name: "contacts",
                                            schema: schemas_1.default.contacts,
                                            writeValidator: (function (writer, e, instance) {
                                                console.log(writer);
                                                console.log(identity.toString());
                                                if (writer === identity.toString()) {
                                                    return true;
                                                }
                                                else {
                                                    return false;
                                                }
                                            })
                                        });
                                    });
                                    return [4 /*yield*/, users.getMailboxID().catch(function () { return null; })];
                                case 15:
                                    mailboxId = _b.sent();
                                    if (!!mailboxId) return [3 /*break*/, 17];
                                    return [4 /*yield*/, users.setupMailbox()];
                                case 16:
                                    _b.sent();
                                    _b.label = 17;
                                case 17:
                                    resolve();
                                    return [3 /*break*/, 19];
                                case 18:
                                    window.alert("Domain record does not match id. Would you like to reconfigure your domain?");
                                    _b.label = 19;
                                case 19: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    TextileChat.prototype.deleteContact = function (contactDomain) {
        return __awaiter(this, void 0, void 0, function () {
            var q, contact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.client || !this.threadId)
                            return [2 /*return*/];
                        q = new hub_1.Where("domain").eq(contactDomain);
                        return [4 /*yield*/, this.client.find(this.threadId, 'contacts', q)];
                    case 1:
                        contact = (_a.sent())[0];
                        if (!contact) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client.delete(this.threadId, "contacts", [contact._id])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TextileChat.prototype.getContacts = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var emitter, contacts;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.client || !this.threadId)
                    return [2 /*return*/];
                emitter = new events_1.EventEmitter();
                emitter.on('contacts', cb);
                contacts = [];
                this.client.find(this.threadId, "contacts", {}).then(function (result) {
                    result.map(function (contact) {
                        contacts.push({ domain: contact.domain, id: contact._id });
                    });
                    emitter.emit('contacts', contacts);
                });
                this.client.listen(this.threadId, [{ collectionName: 'contacts' }], function (contact) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (!(contact === null || contact === void 0 ? void 0 : contact.instance))
                            return [2 /*return*/];
                        contacts.push({ domain: contact.instance.domain, id: contact.instance._id });
                        emitter.emit('contacts', contacts);
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    ;
    TextileChat.prototype.sendContactInvite = function (contactDomain) {
        return __awaiter(this, void 0, void 0, function () {
            var domainPubKey, recipient, sig, dbInfo, contactInviteMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.signer || !this.identity || !this.client || !this.domain || !this.threadId || !this.users)
                            return [2 /*return*/];
                        return [4 /*yield*/, index_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        domainPubKey = _a.sent();
                        if (!domainPubKey) {
                            throw new Error("Domain does not have pubkey set");
                        }
                        recipient = hub_1.PublicKey.fromString(domainPubKey);
                        return [4 /*yield*/, index_1.encrypt(hub_1.PublicKey.fromString(this.identity.public.toString()), domainPubKey)];
                    case 2:
                        sig = _a.sent();
                        return [4 /*yield*/, this.client.getDBInfo(this.threadId)];
                    case 3:
                        dbInfo = _a.sent();
                        contactInviteMessage = {
                            type: "ContactInvite",
                            sig: sig,
                            domain: this.domain,
                            dbInfo: JSON.stringify(dbInfo),
                            threadId: this.threadId.toString(),
                        };
                        return [4 /*yield*/, this.users.sendMessage(this.identity, recipient, new TextEncoder().encode(JSON.stringify(contactInviteMessage)))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    TextileChat.prototype.getInvites = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var emitter, messages, privateKey, contactInvites, mailboxID;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.users || !this.identity)
                            return [2 /*return*/];
                        emitter = new events_1.EventEmitter();
                        emitter.on('invites', cb);
                        return [4 /*yield*/, this.users.listInboxMessages()];
                    case 1:
                        messages = _a.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        return [4 /*yield*/, Promise.all(messages.map(function (message) { return __awaiter(_this, void 0, void 0, function () {
                                var body, _a, _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _b = (_a = JSON).parse;
                                            _d = (_c = new TextDecoder()).decode;
                                            return [4 /*yield*/, privateKey.decrypt(message.body)];
                                        case 1:
                                            body = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                                            if (body.type === "ContactInvite") {
                                                return [2 /*return*/, { body: body, from: message.from, id: message.id }];
                                            }
                                            return [2 /*return*/, null];
                                    }
                                });
                            }); }))];
                    case 2:
                        contactInvites = (_a.sent()).filter(function (x) { return x !== null; });
                        emitter.emit('invites', contactInvites);
                        contacts.handleAcceptedInvites({
                            identity: privateKey,
                            threadId: this.threadId,
                            signer: this.signer,
                            users: this.users,
                            client: this.client
                        });
                        return [4 /*yield*/, this.users.getMailboxID()];
                    case 3:
                        mailboxID = _a.sent();
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
                                        if (body.type === "ContactInvite") {
                                            contactInviteMessage = {
                                                body: body,
                                                from: message.from,
                                                id: message.id,
                                            };
                                            contactInvites.push(contactInviteMessage);
                                            emitter.emit('invites', contactInviteMessage);
                                        }
                                        if (body.type === "ContactInviteAccepted") {
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
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    TextileChat.prototype.acceptContactInvite = function (contactInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var contactPubKey, dbInfo, privateKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.signer || !this.client || !this.threadId || !this.users || !this.identity || !this.domain)
                            return [2 /*return*/];
                        return [4 /*yield*/, index_1.getAndVerifyDomainPubKey(this.signer.provider, contactInviteMessage.body.domain, contactInviteMessage.from)];
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
    ;
    TextileChat.prototype.declineInvite = function (contactInviteMessage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.users)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.users.deleteInboxMessage(contactInviteMessage.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    TextileChat.prototype.sendMessage = function (contactDomain, msg, index) {
        return __awaiter(this, void 0, void 0, function () {
            var contactPubKey, msgIndex, pubKey, message, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.client || !this.threadId)
                            return [2 /*return*/];
                        return [4 /*yield*/, index_1.getDomainPubKey(this.signer.provider, contactDomain)];
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
                        return [4 /*yield*/, index_1.encrypt(pubKey, msg)];
                    case 3:
                        message = (_a.body = _b.sent(),
                            _a.owner = "",
                            _a.id = "",
                            _a);
                        return [2 /*return*/, this.client.create(this.threadId, contactPubKey + "-" + index.toString(), [
                                message,
                            ])];
                }
            });
        });
    };
    ;
    TextileChat.prototype.loadContactMessages = function (contactDomain, index, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var emitter, _contactPubKey, _messagesIndex, _contactClient, e_1, contactThreadId, contactMessageIndex, privateKey, ownerDecryptKey, _a, readerDecryptKey, _b, messageList, loadMessages;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.client || !this.threadId || !this.userAuth || !this.identity || !this.signer)
                            return [2 /*return*/];
                        emitter = new events_1.EventEmitter();
                        emitter.on("newMessage", cb);
                        return [4 /*yield*/, index_1.getDomainPubKey(this.signer.provider, contactDomain)];
                    case 1:
                        _contactPubKey = _c.sent();
                        return [4 /*yield*/, messages.getIndex({
                                client: this.client,
                                threadId: this.threadId,
                                pubKey: _contactPubKey,
                            })];
                    case 2:
                        _messagesIndex = _c.sent();
                        return [4 /*yield*/, hub_1.Client.withUserAuth(this.userAuth)];
                    case 3:
                        _contactClient = _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        // TODO: Ask textile about dbInfo
                        return [4 /*yield*/, _contactClient.joinFromInfo(JSON.parse(_messagesIndex.dbInfo))];
                    case 5:
                        // TODO: Ask textile about dbInfo
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _c.sent();
                        if (e_1.message === "db already exists") {
                            // ignore, probably using same textile id
                        }
                        else {
                            throw new Error(e_1.message);
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
                        contactMessageIndex = _c.sent();
                        privateKey = hub_1.PrivateKey.fromString(this.identity.toString());
                        _a = hub_1.PrivateKey.bind;
                        return [4 /*yield*/, index_1.decrypt(privateKey, _messagesIndex.ownerDecryptKey)];
                    case 9:
                        ownerDecryptKey = new (_a.apply(hub_1.PrivateKey, [void 0, _c.sent()]))();
                        _b = hub_1.PrivateKey.bind;
                        return [4 /*yield*/, index_1.decrypt(privateKey, contactMessageIndex.readerDecryptKey)];
                    case 10:
                        readerDecryptKey = new (_b.apply(hub_1.PrivateKey, [void 0, _c.sent()]))();
                        messageList = [];
                        loadMessages = function (pubKey, client, threadId, decryptKey, name, index) { return __awaiter(_this, void 0, void 0, function () {
                            var collectionName, msgs;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        collectionName = pubKey + "-" + index.toString();
                                        return [4 /*yield*/, client.find(threadId, collectionName, {})];
                                    case 1:
                                        msgs = (_a.sent()).instancesList;
                                        return [4 /*yield*/, Promise.all(msgs.map(function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                                var decryptedBody;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, index_1.decryptAndDecode(decryptKey, msg.body)];
                                                        case 1:
                                                            decryptedBody = _a.sent();
                                                            messageList.push({
                                                                body: decryptedBody,
                                                                time: msg.time,
                                                                owner: name,
                                                                id: msg._id,
                                                            });
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 2:
                                        _a.sent();
                                        messageList.sort(function (a, b) { return a.time - b.time; });
                                        emitter.emit('newMessage', messageList);
                                        client.listen(threadId, [{ collectionName: collectionName }], function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                            var decryptedBody;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!msg.instance) {
                                                            return [2 /*return*/];
                                                        }
                                                        return [4 /*yield*/, index_1.decryptAndDecode(decryptKey, msg.instance.body)];
                                                    case 1:
                                                        decryptedBody = _a.sent();
                                                        messageList.push({
                                                            body: decryptedBody,
                                                            time: msg.instance.time,
                                                            owner: name,
                                                            id: msg._id,
                                                        });
                                                        messageList.sort(function (a, b) { return a.time - b.time; });
                                                        emitter.emit('newMessage', messageList);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        loadMessages(_contactPubKey, this.client, this.threadId, ownerDecryptKey, this.domain, index);
                        loadMessages(this.identity.public.toString(), _contactClient, contactThreadId, readerDecryptKey, contactDomain, index);
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return TextileChat;
}());
exports.default = TextileChat;
