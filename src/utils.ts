import { base64, hex } from "@scure/base";
import * as btc from "@scure/btc-signer";

import { BitcoinNetworkType } from "sats-connect";

export type UTXO = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
};

export const getUTXOs = async (
  network: BitcoinNetworkType,
  address: string
): Promise<UTXO[]> => {
  const networkSubpath =
    network === BitcoinNetworkType.Testnet ? "/testnet" : "";

  const url = `https://mempool.space${networkSubpath}/api/address/${address}/utxo`;
  const response = await fetch(url);

  return response.json();
};

export const getTxn = async (
  network: BitcoinNetworkType,
  txid: string
): Promise<any> => {
  const networkSubpath =
    network === BitcoinNetworkType.Testnet ? "/testnet" : "";

  const url = `https://mempool.space${networkSubpath}/api/tx/${txid}`;
  const response = await fetch(url);

  return response.json();
};

export const createPSBT = async (
  networkType: BitcoinNetworkType,
  ordinalsPublicKeyString: string,
  ordinalsUnspentOutputs: UTXO[],
  recipient: string
) => {
  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.TEST_NETWORK : btc.NETWORK;

  const ordinalOutput = ordinalsUnspentOutputs.find(
    (u) =>
      u.txid ===
      "c6f048adea624bbbaf8c25c5b1fb68edd9fa72ced48146e00486e0f9ed3a0443"
  );

  if (!ordinalOutput) {
    throw new Error("ordinalOutput not found");
  }

  const txnData = await getTxn(networkType, ordinalOutput.txid);

  const ordinalPublicKey = hex.decode(ordinalsPublicKeyString);

  // create taproot spend
  const p2tr = btc.p2tr(ordinalPublicKey, undefined, network);

  const tx = new btc.Transaction();

  const recipientAmount = 9750n;

  // ordinals input
  tx.addInput({
    txid: ordinalOutput.txid,
    index: ordinalOutput.vout,
    witnessUtxo: {
      script: p2tr.script,
      amount: BigInt(ordinalOutput.value),
    },
    nonWitnessUtxo: txnData,
    tapInternalKey: ordinalPublicKey,
    sighashType: btc.SigHash.ALL_ANYONECANPAY,
  });

  tx.addOutputAddress(recipient, recipientAmount, network);

  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);
  return psbtB64;
};
