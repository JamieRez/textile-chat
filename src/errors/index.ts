type ChatErrorHandler = (error: ChatErrorOptions) => string;

type ChatErrorOptions = {
  domain?: string;
  signature?: string;
  pubKey?: string;
  expected?: string;
  errorMessage?: string;
};

export enum ChatErrorCode {
  NoPubKeySet = 'NoPubKeySet',
  InvalidSigature = 'InvalidSignature',
  UnknownError = 'UnknownError',
  UnconfiguredDomain = 'UnconfiguredDomain',
  InvalidPubKey = 'InvalidPubKey',
}

const HandlersByCode = {
  [ChatErrorCode.NoPubKeySet]: (params: { domain: string }) =>
    `Domain ${params.domain} does not have a pubKey set`,
  [ChatErrorCode.InvalidSigature]: (params: {
    signature: string;
    pubKey: string;
  }) => `Signature ${params.signature} is invalid for pubKey ${params.pubKey}`,
  [ChatErrorCode.UnknownError]: (params: { errorMessage: string }) =>
    `Unknown Error: "${params.errorMessage}"`,
  [ChatErrorCode.UnconfiguredDomain]: (params: { domain: string }) =>
    `Domain ${params.domain} is unconfigured`,
  [ChatErrorCode.InvalidPubKey]: (params: {
    domain: string;
    pubKey: string;
    expected: string;
  }) => `Domain ${params.domain} pubKey ${params.pubKey} does not match ${params.expected}`,
};

export class ChatError extends Error {
  readonly code: ChatErrorCode;

  constructor(code: ChatErrorCode, options: ChatErrorOptions = {}) {
    const ChatErrorHandler: ChatErrorHandler = HandlersByCode[code];
    let message = ChatErrorHandler(options);
    super(message);
    this.code = code;
    this.name = 'ChatError';
    Object.setPrototypeOf(this, ChatError.prototype);
  }
}

export default ChatError;
