import ethers from "ethers";
declare const registryContract: (provider: ethers.providers.Provider) => ethers.ethers.Contract;
declare const resolverContract: (provider: ethers.providers.Provider, address: string) => ethers.ethers.Contract;
declare const setRecord: (signer: ethers.Signer, domain: string, record: {
    key: string;
    value: string;
}) => Promise<any>;
declare const getRecord: (provider: ethers.providers.Provider, domain: string, key: string) => Promise<any>;
export { registryContract, resolverContract, setRecord, getRecord };
