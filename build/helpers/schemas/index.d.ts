declare const _default: {
    contacts: {
        $schema: string;
        $id: string;
        type: string;
        title: string;
        description: string;
        default: {};
        examples: {
            domain: string;
        }[];
        required: string[];
        properties: {
            _id: {
                type: string;
            };
            domain: {
                $id: string;
                type: string;
                title: string;
                description: string;
                default: string;
                examples: string[];
            };
            owner: {
                type: string;
            };
        };
        additionalProperties: boolean;
    };
    channels: {
        $schema: string;
        title: string;
        type: string;
        properties: {
            _id: {
                type: string;
            };
            name: {
                type: string;
            };
            threadId: {
                type: string;
            };
            dbInfo: {
                type: string;
            };
            indexId: {
                type: string;
            };
            owner: {
                type: string;
            };
        };
    };
    channelsIndex: {
        $schema: string;
        title: string;
        type: string;
        properties: {
            _id: {
                type: string;
            };
            name: {
                type: string;
            };
            owner: {
                type: string;
            };
            threadId: {
                type: string;
            };
            dbInfo: {
                type: string;
            };
            encryptKey: {
                type: string;
            };
        };
    };
    channelMembers: {
        $schema: string;
        title: string;
        type: string;
        properties: {
            _id: {
                type: string;
            };
            name: {
                type: string;
            };
            pubKey: {
                type: string;
            };
            decryptKey: {
                type: string;
            };
        };
    };
    messages: {
        $schema: string;
        title: string;
        type: string;
        properties: {
            _id: {
                type: string;
            };
            body: {
                type: string;
            };
            time: {
                type: string;
            };
            owner: {
                type: string;
            };
            domain: {
                type: string;
            };
        };
    };
    messagesIndex: {
        $schema: string;
        title: string;
        type: string;
        properties: {
            _id: {
                type: string;
            };
            currentLength: {
                type: string;
            };
            limit: {
                type: string;
            };
            readerDecryptKey: {
                type: string;
            };
            ownerDecryptKey: {
                type: string;
            };
            encryptKey: {
                type: string;
            };
            threadId: {
                type: string;
            };
            dbInfo: {
                type: string;
            };
            owner: {
                type: string;
            };
        };
    };
};
export default _default;
