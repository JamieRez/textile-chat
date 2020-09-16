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
        };
        additionalProperties: boolean;
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
        };
    };
};
export default _default;
