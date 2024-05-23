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

const utxoConfig = {
  promise: undefined as Promise<UTXO[]> | undefined,
  limit: 1000,
};
export const getUTXOs = async (
  network: BitcoinNetworkType,
  address: string,
  limit = 1000
): Promise<UTXO[]> => {
  utxoConfig.limit = limit;

  if (utxoConfig.promise) {
    return utxoConfig.promise;
  }

  utxoConfig.promise = getUTXOsInternal(network, address).finally(() => {
    utxoConfig.promise = undefined;
  });

  return utxoConfig.promise;
};

const getUTXOsInternal = async (
  network: BitcoinNetworkType,
  address: string
): Promise<UTXO[]> => {
  const url =
    network === BitcoinNetworkType.Testnet
      ? `https://btc-testnet.xverse.app/address/${address}/txs`
      : `https://btc-1.xverse.app/address/${address}/txs`;

  const response = await fetch(url);

  const allTxns = await response.json();

  let done = allTxns.length === 0;

  while (!done) {
    const response = await fetch(
      url + `?after_txid=${allTxns[allTxns.length - 1].txid}`
    );

    if (response.status === 429) {
      console.log("Rate limited, waiting 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    const batchTxns = await response.json();

    allTxns.push(...batchTxns);

    done = batchTxns.length === 0;
  }

  const validTxns: any[] = [];
  for (const tx of allTxns) {
    if (
      tx.vout.some((output: any) => output.scriptpubkey_address === address)
    ) {
      validTxns.push(tx);
    }
  }

  const utxos: UTXO[] = [];
  for (const tx of validTxns) {
    const response = await fetch(
      network === BitcoinNetworkType.Testnet
        ? `https://btc-testnet.xverse.app/tx/${tx.txid}/outspends`
        : `https://btc-1.xverse.app/tx/${tx.txid}/outspends`
    );

    if (response.status === 429) {
      console.log("Rate limited, waiting 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    const outSpends = await response.json();

    for (const [idx, output] of tx.vout.entries()) {
      if (output.scriptpubkey_address === address && !outSpends[idx].spent) {
        utxos.push({
          txid: tx.txid,
          vout: idx,
          status: {
            confirmed: tx.status.confirmed,
          },
          value: output.value,
        });

        if (utxos.length >= utxoConfig.limit) {
          return utxos;
        }
      }
    }
  }

  return utxos;
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
