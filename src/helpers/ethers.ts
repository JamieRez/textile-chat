import RegistryContract from "../contracts/Registry.json";
import DefaultResolverContract from "../contracts/DefaultResolver.json";
import ethers from "ethers";

const registryContract = (provider: ethers.providers.Provider) =>
  new ethers.Contract(RegistryContract.address, RegistryContract.abi, provider);

const resolverContract = (
  provider: ethers.providers.Provider,
  address: string
) => new ethers.Contract(address, DefaultResolverContract.abi, provider);

const getResolverContract = async (
  provider: ethers.providers.Provider,
  domain: string
): Promise<ethers.Contract> => {
  const tokenId = ethers.utils.namehash(domain);
  const RegistryContract = registryContract(provider);
  const resolverAddress = await RegistryContract.resolverOf(tokenId);
  if (!resolverAddress || resolverAddress === `0x${"0".repeat(40)}`) {
    throw new Error("No resolver set");
  }
  const ResolverContract = resolverContract(provider, resolverAddress);
  return ResolverContract;
};

const setRecord = async (
  signer: ethers.Signer,
  domain: string,
  record: {
    key: string;
    value: string;
  }
) => {
  const tokenId = ethers.utils.namehash(domain);
  const ResolverContract = (
    await getResolverContract(signer.provider!, domain)
  ).connect(signer);
  return ResolverContract.set(record.key, record.value, tokenId);
};

const getRecord = async (
  provider: ethers.providers.Provider,
  domain: string,
  key: string
) => {
  const tokenId = ethers.utils.namehash(domain);
  const ResolverContract = await getResolverContract(provider, domain);
  return ResolverContract.get(key, tokenId);
};

export { registryContract, resolverContract, setRecord, getRecord };
