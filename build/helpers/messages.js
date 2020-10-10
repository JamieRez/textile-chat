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
exports.collectionCreate = exports.createContactIndex = exports.getContactIndex = void 0;
var hub_1 = require("@textile/hub");
var schemas_1 = __importDefault(require("./schemas"));
var _1 = require(".");
var errors_1 = __importStar(require("../errors"));
var CONTACT_INDEX_LIMIT = 50;
var createContactIndex = function (_a) {
    var threadId = _a.threadId, contactPubKey = _a.contactPubKey, client = _a.client, privateKey = _a.privateKey, contactThreadId = _a.contactThreadId, contactDbInfo = _a.contactDbInfo, identity = _a.identity;
    return __awaiter(void 0, void 0, void 0, function () {
        var messagesIndexCollectionName, writeValidator, writeValidatorStr, contact, encryptionWallet, readerDecryptKey, ownerDecryptKey, messagesIndex, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messagesIndexCollectionName = contactPubKey + '-index';
                    writeValidator = function (writer, event, instance) {
                        // eslint-disable-next-line prettier/prettier
                        var ownerPub = 'replaceThis';
                        if (writer === ownerPub) {
                            return true;
                        }
                        return false;
                    };
                    writeValidatorStr = _1.getFunctionBody(writeValidator).replace('replaceThis', identity.public.toString());
                    // await client.deleteCollection(threadId, contactPubKey + '-index');
                    return [4 /*yield*/, _1.findOrCreateCollection({
                            client: client,
                            threadId: threadId,
                            collectionName: messagesIndexCollectionName,
                            schema: schemas_1.default.messagesIndex,
                        })];
                case 1:
                    // await client.deleteCollection(threadId, contactPubKey + '-index');
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
                        owner: identity.public.toString(),
                        _id: 'index',
                    };
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, client.delete(threadId, messagesIndexCollectionName, [
                            messagesIndex._id,
                        ])];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    console.log(e_1);
                    return [3 /*break*/, 7];
                case 7: return [4 /*yield*/, client
                        .create(threadId, messagesIndexCollectionName, [messagesIndex])
                        .catch(function (e) {
                        if (e.message === "can't create already existing instance") {
                            // Contact index already created - ignore error
                        }
                        else {
                            throw new errors_1.default(errors_1.ChatErrorCode.UnknownError, {
                                errorMessage: e.message,
                            });
                        }
                    })];
                case 8:
                    _b.sent();
                    // await client.deleteCollection(threadId, contactPubKey + '-0');
                    return [4 /*yield*/, _1.findOrCreateCollection({
                            client: client,
                            threadId: threadId,
                            collectionName: contactPubKey + '-0',
                            schema: schemas_1.default.messages,
                        })];
                case 9:
                    // await client.deleteCollection(threadId, contactPubKey + '-0');
                    _b.sent();
                    return [2 /*return*/, messagesIndex];
            }
        });
    });
};
exports.createContactIndex = createContactIndex;
var getContactIndex = function (_a) {
    var client = _a.client, threadId = _a.threadId, pubKey = _a.pubKey;
    return __awaiter(void 0, void 0, void 0, function () {
        var q, collection;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    q = new hub_1.Where('_id').eq('index');
                    return [4 /*yield*/, client.find(threadId, pubKey + '-index', q)];
                case 1:
                    collection = _b.sent();
                    return [2 /*return*/, collection[0]];
            }
        });
    });
};
exports.getContactIndex = getContactIndex;
var collectionCreate = function (_a) {
    var indexNumber = _a.indexNumber, client = _a.client, threadId = _a.threadId, contactPubKey = _a.contactPubKey;
    return __awaiter(void 0, void 0, void 0, function () {
        var collectionName;
        return __generator(this, function (_b) {
            collectionName = contactPubKey + '-' + indexNumber.toString();
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
