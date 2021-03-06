"use strict";
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
exports.sendMessage = exports.collectionCreate = exports.createIndex = exports.getIndex = exports.loadMessages = exports.listenForMessages = void 0;
var hub_1 = require("@textile/hub");
var schemas_1 = __importDefault(require("./schemas"));
var _1 = require(".");
var textile_1 = require("./textile");
var events_1 = __importDefault(require("events"));
var CONTACT_INDEX_LIMIT = 50;
var createIndex = function (_a) {
    var threadId = _a.threadId, contactPubKey = _a.contactPubKey, client = _a.client, privateKey = _a.privateKey, contactThreadId = _a.contactThreadId, contactDbInfo = _a.contactDbInfo, identity = _a.identity;
    return __awaiter(void 0, void 0, void 0, function () {
        var messagesIndexCollectionName, contact, encryptionWallet, readerDecryptKey, ownerDecryptKey, messagesIndex;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messagesIndexCollectionName = contactPubKey + "-index";
                    // try{
                    //   await client.deleteCollection(threadId, messagesIndexCollectionName);
                    // } catch {
                    // }
                    //DELETE THE MESSAGES INDEX
                    return [4 /*yield*/, _1.findOrCreateCollection({
                            client: client,
                            threadId: threadId,
                            collectionName: messagesIndexCollectionName,
                            schema: schemas_1.default.messagesIndex,
                            writeValidator: (function (writer, event, instance) {
                                var patch = event.patch.json_patch;
                                var type = event.patch.type;
                                if (type === "create") {
                                    if (writer === patch.owner) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                                else {
                                    if (writer === instance.owner) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            })
                        })];
                case 1:
                    // try{
                    //   await client.deleteCollection(threadId, messagesIndexCollectionName);
                    // } catch {
                    // }
                    //DELETE THE MESSAGES INDEX
                    _b.sent();
                    contact = hub_1.PublicKey.fromString(contactPubKey);
                    encryptionWallet = hub_1.PrivateKey.fromRandom();
                    return [4 /*yield*/, contact.encrypt(encryptionWallet.seed)];
                case 2:
                    readerDecryptKey = (_b.sent()).toString();
                    return [4 /*yield*/, privateKey.public.encrypt(encryptionWallet.seed)];
                case 3:
                    ownerDecryptKey = (_b.sent()).toString();
                    messagesIndex = {
                        currentLength: 0,
                        limit: CONTACT_INDEX_LIMIT,
                        readerDecryptKey: readerDecryptKey,
                        ownerDecryptKey: ownerDecryptKey,
                        encryptKey: encryptionWallet.public.toString(),
                        threadId: contactThreadId,
                        dbInfo: contactDbInfo,
                        _id: "index",
                        owner: identity.public.toString()
                    };
                    // try {
                    //   await client.delete(threadId, messagesIndexCollectionName, [
                    //     messagesIndex._id,
                    //   ]);
                    // } catch (e) {
                    //   console.log(e);
                    // }
                    return [4 /*yield*/, client
                            .create(threadId, messagesIndexCollectionName, [messagesIndex])
                            .catch(function (e) {
                            if (e.message === "can't create already existing instance") {
                                // Contact index already created - ignore error
                            }
                            else {
                                throw Error(e.message);
                            }
                        })];
                case 4:
                    // try {
                    //   await client.delete(threadId, messagesIndexCollectionName, [
                    //     messagesIndex._id,
                    //   ]);
                    // } catch (e) {
                    //   console.log(e);
                    // }
                    _b.sent();
                    // const m2: any = await client.find(threadId, contactPubKey + "-0" , {});
                    // await client.delete(threadId, contactPubKey + "-0", m2.map((msg: any) => msg._id));
                    // try{
                    //   await client.deleteCollection(threadId, contactPubKey + "-0");
                    // } catch {
                    // }
                    return [4 /*yield*/, _1.findOrCreateCollection({
                            client: client,
                            threadId: threadId,
                            collectionName: contactPubKey + "-0",
                            schema: schemas_1.default.messages,
                            writeValidator: (function (writer, event, instance) {
                                var patch = event.patch.json_patch;
                                var type = event.patch.type;
                                if (type === "create") {
                                    if (writer === patch.owner) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                                else {
                                    if (writer === instance.owner) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            })
                        })];
                case 5:
                    // const m2: any = await client.find(threadId, contactPubKey + "-0" , {});
                    // await client.delete(threadId, contactPubKey + "-0", m2.map((msg: any) => msg._id));
                    // try{
                    //   await client.deleteCollection(threadId, contactPubKey + "-0");
                    // } catch {
                    // }
                    _b.sent();
                    return [2 /*return*/, messagesIndex];
            }
        });
    });
};
exports.createIndex = createIndex;
var getIndex = function (_a) {
    var client = _a.client, threadId = _a.threadId, pubKey = _a.pubKey;
    return __awaiter(void 0, void 0, void 0, function () {
        var q, collection;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    q = new hub_1.Where("_id").eq("index");
                    return [4 /*yield*/, client.find(threadId, pubKey + "-index", q)];
                case 1:
                    collection = _b.sent();
                    return [2 /*return*/, collection[0]];
            }
        });
    });
};
exports.getIndex = getIndex;
var collectionCreate = function (_a) {
    var indexNumber = _a.indexNumber, client = _a.client, threadId = _a.threadId, contactPubKey = _a.contactPubKey;
    return __awaiter(void 0, void 0, void 0, function () {
        var collectionName;
        return __generator(this, function (_b) {
            collectionName = contactPubKey + "-" + indexNumber.toString();
            return [2 /*return*/, _1.findOrCreateCollection({
                    client: client,
                    threadId: threadId,
                    collectionName: collectionName,
                    schema: schemas_1.default.messages,
                    writeValidator: (function (writer, event, instance) {
                        var patch = event.patch.json_patch;
                        var type = event.patch.type;
                        if (type === "create") {
                            if (writer === patch.owner) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            if (writer === instance.owner) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                    })
                })];
        });
    });
};
exports.collectionCreate = collectionCreate;
var sendMessage = function (_a) {
    var messagesIndex = _a.messagesIndex, client = _a.client, threadId = _a.threadId, index = _a.index, contactPubKey = _a.contactPubKey, msg = _a.msg;
    return __awaiter(void 0, void 0, void 0, function () {
        var pubKey, message, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pubKey = hub_1.PublicKey.fromString(messagesIndex.encryptKey);
                    _b = {
                        time: Date.now()
                    };
                    return [4 /*yield*/, textile_1.encrypt(pubKey, msg)];
                case 1:
                    message = (_b.body = _c.sent(),
                        _b.owner = "",
                        _b.id = "",
                        _b);
                    return [2 /*return*/, client.create(threadId, contactPubKey + "-" + index.toString(), [
                            message,
                        ])];
            }
        });
    });
};
exports.sendMessage = sendMessage;
var loadMessages = function (_a) {
    var pubKey = _a.pubKey, client = _a.client, threadId = _a.threadId, decryptKey = _a.decryptKey, name = _a.name, index = _a.index;
    return __awaiter(void 0, void 0, void 0, function () {
        var collectionName, msgs, messageList;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    collectionName = pubKey + "-" + index.toString();
                    return [4 /*yield*/, client.find(threadId, collectionName, {})];
                case 1:
                    msgs = (_b.sent());
                    messageList = [];
                    return [4 /*yield*/, Promise.all(msgs.map(function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                            var decryptedBody;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, _1.decryptAndDecode(decryptKey, msg.body)];
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
                    _b.sent();
                    messageList.sort(function (a, b) { return a.time - b.time; });
                    return [2 /*return*/, messageList];
            }
        });
    });
};
exports.loadMessages = loadMessages;
var listenForMessages = function (_a) {
    var pubKey = _a.pubKey, client = _a.client, threadId = _a.threadId, decryptKey = _a.decryptKey, name = _a.name, index = _a.index, cb = _a.cb;
    return __awaiter(void 0, void 0, void 0, function () {
        var collectionName, emitter;
        return __generator(this, function (_b) {
            collectionName = pubKey + "-" + index.toString();
            emitter = new events_1.default.EventEmitter();
            emitter.on("newMessage", cb);
            client.listen(threadId, [{ collectionName: collectionName }], function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                var decryptedBody;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!msg.instance) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, _1.decryptAndDecode(decryptKey, msg.instance.body)];
                        case 1:
                            decryptedBody = _a.sent();
                            emitter.emit("newMessage", [
                                {
                                    body: decryptedBody,
                                    time: msg.instance.time,
                                    owner: name,
                                    id: msg._id,
                                },
                            ]);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
exports.listenForMessages = listenForMessages;
