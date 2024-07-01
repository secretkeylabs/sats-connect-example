import { base64, hex } from "@scure/base";
import * as btc from "@scure/btc-signer";
import { useEffect, useMemo, useState } from "react";
import { BitcoinNetworkType, signTransaction } from "sats-connect";
import { UTXO, UtxoRunes, getUTXOs, getUtxosWithRuneBalances } from "../utils";

type Props = {
  network: BitcoinNetworkType;
  paymentsAddress: string;
  paymentsPublicKey: string;
  ordinalsAddress: string;
  ordinalsPublicKey: string;
};

const RuneActions = ({
  network,
  paymentsAddress,
  paymentsPublicKey,
  ordinalsAddress,
  ordinalsPublicKey,
}: Props) => {
  const [recipient, setRecipient] = useState("");
  const [feeRate, setFeeRate] = useState("");
  const [utxos, setUtxos] = useState<UtxoRunes[]>([]);
  const [paymentsUtxos, setPaymentsUtxos] = useState<UTXO[]>([]);

  useEffect(() => {
    const populateUtxos = async () => {
      const utxos = await getUtxosWithRuneBalances(network, ordinalsAddress);
      setUtxos(utxos);
      const paymentsU = await getUTXOs(network, paymentsAddress);
      setPaymentsUtxos(paymentsU);
    };
    populateUtxos();
  }, []);

  const runeBalances = useMemo(() => {
    const balances: { [runeId: string]: number } = {};

    for (const utxo of utxos) {
      for (const [runeName, { amount }] of utxo.runes) {
        if (balances[runeName]) {
          balances[runeName] += amount;
        } else {
          balances[runeName] = amount;
        }
      }
    }

    return balances;
  }, [utxos]);

  const recipientValid = useMemo(() => {
    if (!recipient) return false;

    try {
      const decoded = btc
        .Address(
          network === BitcoinNetworkType.Testnet
            ? btc.TEST_NETWORK
            : btc.NETWORK
        )
        .decode(recipient);
      return decoded.type !== "unknown";
    } catch (e) {
      return false;
    }
  }, [recipient]);

  const balancesExist = Object.values(runeBalances).some((b) => b > 0);

  const onSignTransactionClick = async () => {
    const NETWORK =
      network === BitcoinNetworkType.Testnet ? btc.TEST_NETWORK : btc.NETWORK;

    const decodedPaymentsAddress = btc.Address(NETWORK).decode(paymentsAddress);

    let p2Pay = btc.p2wpkh(hex.decode(paymentsPublicKey), NETWORK);
    let payInVsize = 91;
    let payOutVsize = 32;
    if (decodedPaymentsAddress.type === "sh") {
      p2Pay = btc.p2sh(p2Pay, NETWORK);
      payInVsize = 68;
      payOutVsize = 31;
    }

    const ordInVsize = 57;
    const ordOutVsize = 43;
    const p2Ord = btc.p2tr(hex.decode(ordinalsPublicKey), undefined, NETWORK);

    const payIndexesToSign: number[] = [];
    const trIndexesToSign: number[] = [];
    const tx = new btc.Transaction();

    let totalSats = 0;
    let vSize = 32 + 2; // 2 for in/out length

    const runeUtxos = utxos.filter((utxo) =>
      utxo.runes.some((r) => r[1].amount > 0)
    );

    runeUtxos.forEach((utxo) => {
      tx.addInput({
        txid: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: p2Ord.script,
          amount: BigInt(utxo.value),
        },
        tapInternalKey: p2Ord.tapInternalKey,
        sighashType: btc.SigHash.DEFAULT,
      });

      totalSats += utxo.value;

      trIndexesToSign.push(tx.inputsLength - 1);
      vSize += ordInVsize;
    });

    tx.addOutputAddress(recipient, 546n, NETWORK);
    vSize += ordOutVsize;

    let enoughFunds = false;
    for (const payUtxo of paymentsUtxos) {
      tx.addInput({
        txid: payUtxo.txid,
        index: payUtxo.vout,
        witnessUtxo: {
          script: p2Pay.script,
          amount: BigInt(payUtxo.value),
        },
        ...p2Pay,
        sighashType: btc.SigHash.ALL,
      });

      totalSats += payUtxo.value;
      vSize += payInVsize;
      payIndexesToSign.push(tx.inputsLength - 1);

      const fee = +feeRate * (vSize + payOutVsize);
      const change = totalSats - 546 - fee;

      if (change > 1000) {
        enoughFunds = true;

        tx.addOutputAddress(paymentsAddress, BigInt(change), NETWORK);
        break;
      }
    }

    if (!enoughFunds) {
      alert(
        "Not enough funds in the payments address to pay for the transaction"
      );
      return;
    }

    const psbt = tx.toPSBT();
    const psbtBase64 = base64.encode(psbt);
    await signTransaction({
      payload: {
        network: {
          type: network,
        },
        message: "Send all my Runes",
        psbtBase64,
        broadcast: true,
        inputsToSign: [
          {
            address: paymentsAddress,
            signingIndexes: payIndexesToSign,
            sigHash: btc.SigHash.ALL,
          },
          {
            address: ordinalsAddress,
            signingIndexes: trIndexesToSign,
            sigHash: btc.SigHash.DEFAULT,
          },
        ],
      },
      onFinish: async (response) => {
        const mempoolUrl =
          network === BitcoinNetworkType.Testnet
            ? "https://mempool.space/testnet/tx/"
            : "https://mempool.space/tx/";

        window.open(mempoolUrl + response.txId, "_blank");

        setRecipient("");
      },
      onCancel: () => alert("Canceled"),
    });
  };

  return (
    <div className="container">
      <h3>Send all Runes to an address</h3>

      <div>
        <p>
          This tool will send all runes from the connected ordinals address to a
          recipient address. The tool will create a transaction with all the
          UTXOs on the ordinals address which have runes on them, and with a
          single output to the recipient address. By not adding the OP_RETURN
          script for runes to the transaction, all runes will be sent to the
          first output and this transaction will be signable with a Ledger
          device.
        </p>
        <p>
          Please note that all runes in the ordinals address will be sent to the
          recipient in a single UTXO, and it will be up to the recipient to
          split them into separate UTXOs as needed.
        </p>
        <p>
          This tool will construct a transaction and send it to your wallet for
          signing. Please make sure that you are happy with the transaction
          before signing it as we take no responsibility for any lost funds.
        </p>
        <p>
          <b>Recipient address</b>
          <br />
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </p>
        <p>
          <b>Fee rate</b>
          <br />
          <input
            value={feeRate}
            type="number"
            onChange={(e) => setFeeRate(e.target.value)}
          />
        </p>
        <div>
          <b>Rune balances which will be transferred</b>
          <br />
          {Object.keys(runeBalances).length === 0 && (
            <div>No rune balances found!</div>
          )}
          {Object.entries(runeBalances).map(([rune, balance]) => (
            <div key={rune}>
              {rune} - {balance}
            </div>
          ))}
        </div>
      </div>
      <div>
        <button
          onClick={onSignTransactionClick}
          disabled={!recipientValid || !balancesExist || !feeRate}
        >
          Send Request to Wallet
        </button>
      </div>
    </div>
  );
};

export default RuneActions;
