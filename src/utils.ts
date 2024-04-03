import { base64, hex } from "@scure/base";
import * as btc from "@scure/btc-signer";

import { BitcoinNetworkType } from "sats-connect";
import { estimateVSize } from "./vsizeEstimator";

export type UTXO = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
  };
  value: number;
};

type BlockInfoUtxo = {
  tx_hash_big_endian: string;
  tx_hash: string;
  tx_output_n: number;
  script: string;
  value: number;
  value_hex: string;
  confirmations: number;
  tx_index: number;
};

type BlockInfoResp = { unspent_outputs: BlockInfoUtxo[] };

export const getUTXOs = async (
  network: BitcoinNetworkType,
  address: string
): Promise<UTXO[]> => {
  try {
    const networkSubpath =
      network === BitcoinNetworkType.Testnet ? "/testnet" : "";

    const url = `https://mempool.space${networkSubpath}/api/address/${address}/utxo`;
    const response = await fetch(url);

    return await response.json();
  } catch (e) {
    if (network === BitcoinNetworkType.Testnet) {
      alert("Failed to fetch UTXOs from mempool");
      return [];
    } else {
      alert("Failed to fetch UTXOs from mempool. Trying blockchain.info");

      const url = `https://blockchain.info/unspent?active=${address}&limit=1000`;
      const response = await fetch(url);

      const resp = (await response.json()) as BlockInfoResp;

      return resp.unspent_outputs.map((utxo: any) => ({
        txid: utxo.tx_hash_big_endian,
        vout: utxo.tx_output_n,
        status: {
          confirmed: utxo.confirmations > 0,
        },
        value: utxo.value,
      }));
    }
  }
};

const getPayment = (
  networkType: BitcoinNetworkType,
  paymentAddress: string,
  paymentPublicKeyStr: string
) => {
  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.TEST_NETWORK : btc.NETWORK;

  const paymentPublicKey = hex.decode(paymentPublicKeyStr);

  const p2wpkh = btc.p2wpkh(paymentPublicKey, network);

  switch (btc.Address(network).decode(paymentAddress).type) {
    case "wpkh":
      return p2wpkh;
    case "sh":
      return btc.p2sh(p2wpkh, network);
    default:
      return undefined;
  }
};

export const createPSBT = async (
  networkType: BitcoinNetworkType,
  paymentAddress: string,
  paymentPublicKeyString: string,
  paymentUnspentOutputs: UTXO[],
  recipient: string,
  feeRate: number
) => {
  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.TEST_NETWORK : btc.NETWORK;

  const signingIndexes: number[] = [];

  const p2 = getPayment(networkType, paymentAddress, paymentPublicKeyString);

  if (!p2) {
    alert("Invalid payment address");
    return ["", signingIndexes, 0] as const;
  }

  const tx = new btc.Transaction({
    allowUnknownOutputs: true,
  });

  let idx = 0;
  let totalIn = 0n;
  for (const utxo of paymentUnspentOutputs) {
    signingIndexes.push(idx++);
    tx.addInput({
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2.script,
        amount: BigInt(utxo.value),
      },
      redeemScript: p2.redeemScript,
      witnessScript: p2.witnessScript,
      sighashType: btc.SigHash.ALL,
    });
    totalIn += BigInt(utxo.value);
  }

  const txCopy = tx.clone();

  txCopy.addOutputAddress(recipient, (totalIn * 95n) / 100n, network);
  const vsize = estimateVSize(networkType, txCopy);

  const fee = BigInt(Math.ceil(vsize * feeRate));
  const change = totalIn - fee;

  tx.addOutputAddress(recipient, change, network);

  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);
  return [psbtB64, signingIndexes, Number(change)] as const;
};
