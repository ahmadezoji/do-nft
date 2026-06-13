import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";

const require = createRequire(import.meta.url);
const solc = require("solc") as {
  compile: (
    input: string,
    options: {
      import: (importPath: string) => { contents?: string; error?: string };
    }
  ) => string;
};
const { createPublicClient, createWalletClient, http } = require("viem") as any;
const { privateKeyToAccount } = require("viem/accounts") as any;
const { polygon } = require("viem/chains") as any;

const currentFilePath = fileURLToPath(import.meta.url);
const blockchainModuleDir = path.dirname(currentFilePath);
const backendRootDir = path.resolve(blockchainModuleDir, "../../..");
const contractSourcePath = path.resolve(backendRootDir, "contracts/DoNftCollection.sol");

let cachedArtifact:
  | {
      abi: unknown[];
      bytecode: `0x${string}`;
    }
  | null = null;

const CONTRACT_NAME = "DoNftCollection";

const normalizePrivateKey = (value: string) => (value.startsWith("0x") ? value : `0x${value}`);

const buildOpenSeaUrl = (contractAddress: string, tokenId: string) =>
  `https://opensea.io/assets/matic/${contractAddress}/${encodeURIComponent(tokenId)}`;

const buildMetadataUri = (cid: string) => `ipfs://${cid}`;

const resolveImport = (importPath: string) => {
  try {
    const resolvedPath = require.resolve(importPath, {
      paths: [backendRootDir, path.resolve(backendRootDir, "../node_modules"), path.resolve(backendRootDir, "node_modules")]
    });

    return {
      contents: require("node:fs").readFileSync(resolvedPath, "utf8")
    };
  } catch {
    return {
      error: `File not found: ${importPath}`
    };
  }
};

const loadArtifact = async () => {
  if (cachedArtifact) {
    return cachedArtifact;
  }

  const source = await readFile(contractSourcePath, "utf8");
  const compilerInput = {
    language: "Solidity",
    sources: {
      "DoNftCollection.sol": {
        content: source
      }
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"]
        }
      }
    }
  };

  const compiled = JSON.parse(solc.compile(JSON.stringify(compilerInput), { import: resolveImport })) as {
    contracts?: Record<string, Record<string, { abi: unknown[]; evm: { bytecode: { object: string } } }>>;
    errors?: Array<{ severity: string; formattedMessage: string }>;
  };

  const compilationErrors = compiled.errors?.filter((error) => error.severity === "error") ?? [];

  if (compilationErrors.length > 0) {
    throw new AppError(compilationErrors.map((error) => error.formattedMessage).join("\n"), 500);
  }

  const artifact = compiled.contracts?.["DoNftCollection.sol"]?.[CONTRACT_NAME];

  if (!artifact?.evm?.bytecode?.object) {
    throw new AppError("Contract compilation failed for DoNftCollection.", 500);
  }

  cachedArtifact = {
    abi: artifact.abi,
    bytecode: `0x${artifact.evm.bytecode.object}`
  };

  return cachedArtifact;
};

export class BlockchainService {
  private getClients() {
    if (!env.ALCHEMY_RPC_URL || !env.WALLET_PRIVATE_KEY) {
      throw new AppError(
        "Blockchain publishing is not configured. Add ALCHEMY_RPC_URL and WALLET_PRIVATE_KEY to the backend environment.",
        400
      );
    }

    const account = privateKeyToAccount(normalizePrivateKey(env.WALLET_PRIVATE_KEY));

    return {
      account,
      publicClient: createPublicClient({
        chain: polygon,
        transport: http(env.ALCHEMY_RPC_URL)
      }),
      walletClient: createWalletClient({
        account,
        chain: polygon,
        transport: http(env.ALCHEMY_RPC_URL)
      })
    };
  }

  getPublisherAddress() {
    return this.getClients().account.address as string;
  }

  buildMetadataUri(cid: string) {
    return buildMetadataUri(cid);
  }

  buildOpenSeaUrl(contractAddress: string, tokenId: string) {
    return buildOpenSeaUrl(contractAddress, tokenId);
  }

  async deployCollectionContract(input: { name: string; symbol: string }) {
    const artifact = await loadArtifact();
    const { account, publicClient, walletClient } = this.getClients();
    const hash = await walletClient.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      args: [input.name, input.symbol, account.address]
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new AppError("Contract deployment finished without a contract address.", 502);
    }

    return {
      contractAddress: receipt.contractAddress as string,
      txHash: hash as string,
      ownerAddress: account.address as string,
      chain: "polygon"
    };
  }

  async mintNft(input: { contractAddress: string; metadataUri: string; ownerWallet?: string }) {
    const artifact = await loadArtifact();
    const { account, publicClient, walletClient } = this.getClients();
    const recipientAddress = input.ownerWallet || account.address;
    const nextTokenId = await publicClient.readContract({
      address: input.contractAddress,
      abi: artifact.abi,
      functionName: "nextTokenId"
    });
    const hash = await walletClient.writeContract({
      address: input.contractAddress,
      abi: artifact.abi,
      functionName: "mintNFT",
      args: [recipientAddress, input.metadataUri]
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return {
      tokenId: String(nextTokenId),
      txHash: hash as string,
      ownerWallet: recipientAddress as string,
      openseaUrl: buildOpenSeaUrl(input.contractAddress, String(nextTokenId))
    };
  }
}
