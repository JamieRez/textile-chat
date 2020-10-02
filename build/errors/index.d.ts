declare type ChatErrorOptions = {
    domain?: string;
    signature?: string;
    pubKey?: string;
    expected?: string;
    errorMessage?: string;
};
export declare enum ChatErrorCode {
    NoPubKeySet = "NoPubKeySet",
    InvalidSigature = "InvalidSignature",
    UnknownError = "UnknownError",
    UnconfiguredDomain = "UnconfiguredDomain",
    InvalidPubKey = "InvalidPubKey"
}
export declare class ChatError extends Error {
    readonly code: ChatErrorCode;
    constructor(code: ChatErrorCode, options?: ChatErrorOptions);
}
export default ChatError;
