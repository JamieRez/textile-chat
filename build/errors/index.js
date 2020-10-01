"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatError = exports.ChatErrorCode = void 0;
var ChatErrorCode;
(function (ChatErrorCode) {
    ChatErrorCode["NoPubKeySet"] = "NoPubKeySet";
    ChatErrorCode["InvalidSigature"] = "InvalidSignature";
    ChatErrorCode["UnknownError"] = "UnknownError";
    ChatErrorCode["UnconfiguredDomain"] = "UnconfiguredDomain";
    ChatErrorCode["InvalidPubKey"] = "InvalidPubKey";
})(ChatErrorCode = exports.ChatErrorCode || (exports.ChatErrorCode = {}));
var HandlersByCode = (_a = {},
    _a[ChatErrorCode.NoPubKeySet] = function (params) {
        return "Domain " + params.domain + " does not have a pubKey set";
    },
    _a[ChatErrorCode.InvalidSigature] = function (params) { return "Signature " + params.signature + " is invalid for pubKey " + params.pubKey; },
    _a[ChatErrorCode.UnknownError] = function (params) {
        return "Unknown Error: \"" + params.errorMessage + "\"";
    },
    _a[ChatErrorCode.UnconfiguredDomain] = function (params) {
        return "Domain " + params.domain + " is unconfigured";
    },
    _a[ChatErrorCode.InvalidPubKey] = function (params) { return "Domain " + params.domain + " pubKey " + params.pubKey + " does not match " + params.expected; },
    _a);
var ChatError = /** @class */ (function (_super) {
    __extends(ChatError, _super);
    function ChatError(code, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        var ChatErrorHandler = HandlersByCode[code];
        var message = ChatErrorHandler(options);
        _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = 'ChatError';
        Object.setPrototypeOf(_this, ChatError.prototype);
        return _this;
    }
    return ChatError;
}(Error));
exports.ChatError = ChatError;
exports.default = ChatError;
