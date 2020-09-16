"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var contacts_json_1 = __importDefault(require("./contacts.json"));
var messages_json_1 = __importDefault(require("./messages.json"));
var messagesIndex_json_1 = __importDefault(require("./messagesIndex.json"));
exports.default = { contacts: contacts_json_1.default, messages: messages_json_1.default, messagesIndex: messagesIndex_json_1.default };
