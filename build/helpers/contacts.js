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
exports.contactCreate = exports.handleAcceptedInvites = exports.handleAcceptedInvite = exports.deleteContacts = exports.getContacts = exports.configure = exports.sendInviteAccepted = exports.sendInvite = exports.declineInvite = exports.acceptInvite = exports.getInvites = void 0;
var hub_1 = require("@textile/hub");
var _1 = require(".");
var schemas_1 = __importDefault(require("./schemas"));
var messages = __importStar(require("./messages"));
var CONTACT_INDEX_LIMIT = 50;
var deleteContacts = function (client, threadId, contactIds) {
    return client.delete(threadId, "contacts", contactIds);
};
exports.deleteContacts = deleteContacts;
var deleteAllContacts = function (client, threadId) { return __awaiter(void 0, void 0, void 0, function () {
    var contacts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.find(threadId, "contacts", {})];
            case 1:
                contacts = _a.sent();
                deleteContacts(client, threadId, contacts.map(function (contact) { return contact._id; }));
                return [2 /*return*/];
        }
    });
}); };
var getContacts = function (client, threadId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client.find(threadId, "contacts", {}).then(function (result) {
                return result.map(function (contact) {
                    return { domain: contact.domain, id: contact._id };
                });
            })];
    });
}); };
exports.getContacts = getContacts;
var sendInvite = function (_a) {
    var domain = _a.domain, contactDomain = _a.contactDomain, identity = _a.identity, signer = _a.signer, users = _a.users, dbInfo = _a.dbInfo, threadId = _a.threadId;
    return __awaiter(void 0, void 0, void 0, function () {
        var domainPubKey, recipient, sig, contactInviteMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _1.getDomainPubKey(signer.provider, contactDomain)];
                case 1:
                    domainPubKey = _b.sent();
                    if (!domainPubKey) {
                        throw new Error("Domain does not have pubkey set");
                    }
                    recipient = hub_1.PublicKey.fromString(domainPubKey);
                    return [4 /*yield*/, _1.encrypt(identity.public, domainPubKey)];
                case 2:
                    sig = _b.sent();
                    contactInviteMessage = {
                        type: "ContactInvite",
                        sig: sig,
                        domain: domain,
                        dbInfo: JSON.stringify(dbInfo),
                        threadId: threadId.toString(),
                    };
                    return [4 /*yield*/, users.sendMessage(identity, recipient, new TextEncoder().encode(JSON.stringify(contactInviteMessage)))];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.sendInvite = sendInvite;
var sendInviteAccepted = function (_a) {
    var domain = _a.domain, contactInviteMessage = _a.contactInviteMessage, identity = _a.identity, users = _a.users, dbInfo = _a.dbInfo, threadId = _a.threadId;
    var body = {
        type: "ContactInviteAccepted",
        sig: contactInviteMessage.body.sig,
        domain: domain,
        dbInfo: JSON.stringify(dbInfo),
        threadId: threadId.toString(),
    };
    var recipient = hub_1.PublicKey.fromString(contactInviteMessage.from);
    return users.sendMessage(identity, recipient, new TextEncoder().encode(JSON.stringify(body)));
};
exports.sendInviteAccepted = sendInviteAccepted;
var configure = function (_a) {
    var identity = _a.identity, threadId = _a.threadId, signer = _a.signer, users = _a.users, client = _a.client;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, client
                    .find(threadId, "contacts", {})
                    .catch(function () {
                    return client.newCollection(threadId, {
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
                }).then(function () {
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
var getInvites = function (users, identity) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, contactInvites;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, users.listInboxMessages()];
            case 1:
                messages = _a.sent();
                return [4 /*yield*/, Promise.all(messages.map(function (message) { return __awaiter(void 0, void 0, void 0, function () {
                        var body, _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _b = (_a = JSON).parse;
                                    _d = (_c = new TextDecoder()).decode;
                                    return [4 /*yield*/, identity.decrypt(message.body)];
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
                return [2 /*return*/, contactInvites];
        }
    });
}); };
exports.getInvites = getInvites;
var handleAcceptedInvites = function (_a) {
    var identity = _a.identity, threadId = _a.threadId, signer = _a.signer, users = _a.users, client = _a.client;
    return __awaiter(void 0, void 0, void 0, function () {
        var messages;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, users.listInboxMessages()];
                case 1:
                    messages = _b.sent();
                    return [4 /*yield*/, Promise.all(messages.map(function (message) { return __awaiter(void 0, void 0, void 0, function () {
                            var body, _a, _b, _c, _d, contactAcceptedMessage;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _b = (_a = JSON).parse;
                                        _d = (_c = new TextDecoder()).decode;
                                        return [4 /*yield*/, identity.decrypt(message.body)];
                                    case 1:
                                        body = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                                        if (body.type === "ContactInviteAccepted") {
                                            contactAcceptedMessage = {
                                                body: body,
                                                id: message.id,
                                                from: message.from,
                                            };
                                            return [2 /*return*/, handleAcceptedInvite({
                                                    contactAcceptedMessage: contactAcceptedMessage,
                                                    signer: signer,
                                                    threadId: threadId,
                                                    client: client,
                                                    identity: identity,
                                                    users: users,
                                                })];
                                        }
                                        return [2 /*return*/, null];
                                }
                            });
                        }); }))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.handleAcceptedInvites = handleAcceptedInvites;
var handleAcceptedInvite = function (_a) {
    var signer = _a.signer, contactAcceptedMessage = _a.contactAcceptedMessage, identity = _a.identity, client = _a.client, threadId = _a.threadId, users = _a.users;
    return __awaiter(void 0, void 0, void 0, function () {
        var contactPubKey, sig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _1.getAndVerifyDomainPubKey(signer.provider, contactAcceptedMessage.body.domain, contactAcceptedMessage.from)];
                case 1:
                    contactPubKey = _b.sent();
                    return [4 /*yield*/, _1.decryptAndDecode(identity, contactAcceptedMessage.body.sig)];
                case 2:
                    sig = _b.sent();
                    if (sig !== contactPubKey) {
                        throw new Error("Signature does not match domainPubKey");
                    }
                    return [4 /*yield*/, contactCreate(client, threadId, contactAcceptedMessage.body.domain)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, messages.createIndex({
                            threadId: threadId,
                            contactPubKey: contactPubKey,
                            client: client,
                            identity: identity,
                            contactDbInfo: contactAcceptedMessage.body.dbInfo,
                            contactThreadId: contactAcceptedMessage.body.threadId,
                        })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, users.deleteInboxMessage(contactAcceptedMessage.id)];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.handleAcceptedInvite = handleAcceptedInvite;
var contactCreate = function (client, threadId, domain) {
    return client
        .create(threadId, "contacts", [{ domain: domain, _id: domain }])
        .catch(function (e) {
        if (e.message === "can't create already existing instance") {
            // Contact already created - ignore error
        }
        else {
            throw Error(e.message);
        }
    });
};
exports.contactCreate = contactCreate;
var acceptInvite = function (_a) {
    var domain = _a.domain, identity = _a.identity, threadId = _a.threadId, signer = _a.signer, contactInviteMessage = _a.contactInviteMessage, users = _a.users, client = _a.client, dbInfo = _a.dbInfo;
    return __awaiter(void 0, void 0, void 0, function () {
        var contactPubKey;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _1.getAndVerifyDomainPubKey(signer.provider, contactInviteMessage.body.domain, contactInviteMessage.from)];
                case 1:
                    contactPubKey = _b.sent();
                    return [4 /*yield*/, contactCreate(client, threadId, contactInviteMessage.body.domain)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, sendInviteAccepted({
                            threadId: threadId,
                            users: users,
                            identity: identity,
                            dbInfo: dbInfo,
                            signer: signer,
                            contactInviteMessage: contactInviteMessage,
                            domain: domain,
                        })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, messages.createIndex({
                            threadId: threadId,
                            contactPubKey: contactPubKey,
                            identity: identity,
                            client: client,
                            contactThreadId: contactInviteMessage.body.threadId,
                            contactDbInfo: contactInviteMessage.body.dbInfo,
                        })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, users.deleteInboxMessage(contactInviteMessage.id)];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.acceptInvite = acceptInvite;
var declineInvite = function (_a) {
    var contactInviteMessage = _a.contactInviteMessage, users = _a.users;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, users.deleteInboxMessage(contactInviteMessage.id)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.declineInvite = declineInvite;
