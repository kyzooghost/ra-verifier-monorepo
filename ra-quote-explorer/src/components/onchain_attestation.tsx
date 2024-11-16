"use client";

import React, { useState, useTransition } from "react";
import {
  createPublicClient,
  http,
  parseAbi,
  isHex,
  encodeFunctionData,
  type Chain,
  type Hex,
} from "viem";
import { sepolia, holesky } from "viem/chains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Copy, CheckCircle2, XCircle } from "lucide-react";

interface Deployment {
  network: Chain;
  contractAddress: Hex;
}

interface VerificationResult {
  isValid: boolean;
  rawData: Hex;
  decodedMessage?: string;
  quoteHex: Hex;
}

interface DcapVerifyFormProps {
  checksum: string;
}

const automataTestnet: Chain = {
  id: 1398243,
  name: 'Automata Testnet',
  nativeCurrency: { name: 'ATA Coin', symbol: 'ATA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://1rpc.io/ata/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Automata Testnet Explorer',
      url: 'https://explorer-testnet.ata.network',
      apiUrl: 'https://explorer-testnet.ata.network/api',
    },
  },
  testnet: true,
}

const automataMainnet: Chain = {
  id: 65536,
  name: 'Automata Mainnet',
  nativeCurrency: { name: 'ATA Coin', symbol: 'ATA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ata.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Automata Explorer',
      url: 'https://explorer.ata.network',
      apiUrl: 'https://explorer.ata.network/api',
    },
  },
}

const NETWORKS: Deployment[] = [
  {
    network: sepolia,
    contractAddress: "0x76A3657F2d6c5C66733e9b69ACaDadCd0B68788b",
  },
  {
    network: holesky,
    contractAddress: '0x133303659F51d75ED216FD98a0B70CbCD75339b2',
  },
  {
    network: automataTestnet,
    contractAddress: '0xefE368b17D137E86298eec8EbC5502fb56d27832',
  },
  {
    network: automataMainnet,
    contractAddress: '0xE26E11B257856B0bEBc4C759aaBDdea72B64351F',
  },
];

const DEFAULT_NETWORK = NETWORKS[0];

const abi = parseAbi([
  "function verifyAndAttestOnChain(bytes) public view returns (bool, bytes)",
]);

const hexToText = (hex: string): string | undefined => {
  try {
    const cleaned = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = Buffer.from(cleaned, "hex");
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error("Failed to decode hex to text:", error);
    return undefined;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy text:", error);
  }
};

export const DcapVerifyForm = ({ checksum }: DcapVerifyFormProps) => {
  const [selectedNetwork, setSelectedNetwork] =
    useState<Deployment>(DEFAULT_NETWORK);
  const [isPending, startTransition] = useTransition();
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChainDcapVerify = async (
    network: Deployment,
  ): Promise<VerificationResult> => {
    try {
      const response = await fetch(`/raw/${checksum}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch quote: ${response.status} ${response.statusText}`,
        );
      }

      const quoteBuffer = await response.arrayBuffer();
      const quoteHex = `0x${Buffer.from(quoteBuffer).toString("hex")}` as Hex;

      const client = createPublicClient({
        chain: network.network,
        transport: http(),
      });

      const [isValid, data] = (await client.readContract({
        address: network.contractAddress,
        abi,
        functionName: "verifyAndAttestOnChain",
        args: [quoteHex],
      })) as [boolean, Hex];

      const result: VerificationResult = {
        isValid,
        rawData: data,
        quoteHex,
      };

      if (isHex(data)) {
        const decodedMessage = hexToText(data);
        if (decodedMessage) {
          result.decodedMessage = decodedMessage;
        }
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Verification failed: ${error.message}`);
      }
      throw error;
    }
  };

  const handleVerify = () => {
    setError(null);
    setVerificationResult(null);

    startTransition(async () => {
      try {
        const result = await onChainDcapVerify(selectedNetwork);
        setVerificationResult(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    });
  };

  const getCurlCommand = () => {
    if (!verificationResult?.quoteHex) return "";

    // 使用 viem 编码函数调用
    const calldata = encodeFunctionData({
      abi,
      functionName: "verifyAndAttestOnChain",
      args: [verificationResult.quoteHex],
    });

    const jsonRpcPayload = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: selectedNetwork.contractAddress,
          data: calldata,
        },
        "latest",
      ],
      id: 1,
    };

    return `curl -X POST -H "Content-Type: application/json" --data '${JSON.stringify(jsonRpcPayload)}' ${selectedNetwork.network.rpcUrls.default.http[0]}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>DCAP Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Network</label>
            <Select
              value={selectedNetwork.network.id.toString()}
              onValueChange={(value) => {
                const network = NETWORKS.find(
                  (n) => n.network.id.toString() === value,
                );
                if (network) {
                  setSelectedNetwork(network);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map((network) => (
                  <SelectItem
                    key={network.network.id}
                    value={network.network.id.toString()}
                  >
                    {network.network.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-2 overflow-scroll">
            <div className="flex items-center justify-between">
              <span className="text-sm">Network:</span>
              <span className="font-medium">
                {selectedNetwork.network.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Contract:</span>
              <div className="flex items-center gap-2 pr-2">
                <span className="font-mono text-sm truncate">
                  {selectedNetwork.contractAddress}
                </span>
                <a
                  href={`${selectedNetwork.network.blockExplorers?.default.url}/address/${selectedNetwork.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Verifying..." : "Verify"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <Alert
              variant={verificationResult.isValid ? "default" : "destructive"}
              className={
                verificationResult.isValid ? "border-green-200 bg-green-50" : ""
              }
            >
              <div className="flex items-start space-x-2">
                {verificationResult.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="space-y-3 w-full">
                  <AlertTitle className="flex items-center justify-between">
                    <span>Verification Result</span>
                    <Badge
                      variant={
                        verificationResult.isValid ? "default" : "destructive"
                      }
                      className={
                        verificationResult.isValid ? "bg-green-600" : ""
                      }
                    >
                      {verificationResult.isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </AlertTitle>

                  {(!verificationResult.isValid && verificationResult.decodedMessage) && (
                    <div className="space-y-2">
                      <AlertTitle className="text-sm font-medium">
                        Decoded Message
                      </AlertTitle>
                      <AlertDescription>
                        <div className="bg-white/50 p-3 rounded-md border text-sm">
                          {verificationResult.decodedMessage}
                        </div>
                      </AlertDescription>
                    </div>
                  )}

                  <div className="space-y-2">
                    <AlertTitle className="text-sm font-medium">
                      Raw Data
                    </AlertTitle>
                    <AlertDescription>
                      <div className="bg-white/50 p-3 rounded-md border font-mono text-sm break-all">
                        {verificationResult.rawData}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {verificationResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Quote Hex Data</span>
                <Badge variant="secondary" className="font-mono">
                  {`${verificationResult.quoteHex.slice(0, 10)}...${verificationResult.quoteHex.slice(-8)}`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={verificationResult.quoteHex}
                  readOnly
                  className="font-mono h-24 resize-none bg-gray-50/50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-2"
                  onClick={() => copyToClipboard(verificationResult.quoteHex)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>cURL Command</span>
                <Badge variant="secondary">JSON-RPC</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={getCurlCommand()}
                  readOnly
                  className="font-mono h-24 resize-none bg-gray-50/50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-2"
                  onClick={() => copyToClipboard(getCurlCommand())}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
