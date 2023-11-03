import type { Capability } from "sats-connect";
import {
  BitcoinNetworkType,
  sendBtcTransaction,
  signTransaction,
} from "sats-connect";

import * as btc from "@scure/btc-signer";

import { base64, hex } from "@scure/base";
import * as bip32 from "@scure/bip32";
import { useEffect, useMemo, useState } from "react";
import { UTXO, getUTXOs } from "../utils";

type Props = {
  network: BitcoinNetworkType;
  paymentAddress: string;
  paymentPublicKey: string;
  capabilities: Set<Capability>;
};

function hexToBytes(hex: string) {
  let bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return Uint8Array.from(bytes);
}

const testnet = {
  wif: 0xef,
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
};
const keySeed = hexToBytes("ab".repeat(32));
const localKey = bip32.HDKey.fromMasterSeed(keySeed, testnet.bip32);

const TaprootPsbt = ({
  network,
  paymentAddress,
  paymentPublicKey,
  capabilities,
}: Props) => {
  const [utxos, setUtxos] = useState<UTXO[]>([]);

  const taprootBalance = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

  const [taprootScript, taprootAddress] = useMemo(() => {
    const script = btc.Script.encode([
      0,
      localKey.publicKey!.slice(1),
      "CHECKSIGADD",
      hex.decode(paymentPublicKey).slice(1),
      "CHECKSIGADD",
      2,
      "EQUAL",
    ]);
    const pt = btc.p2tr(undefined, { script }, btc.TEST_NETWORK, true);

    return [pt, pt.address!];
  }, []);

  useEffect(() => {
    const populateUtxos = async () => {
      const utxos = await getUTXOs(network, taprootAddress);
      setUtxos(utxos);
    };
    populateUtxos();

    const interval = setInterval(populateUtxos, 20000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const onFundClick = async () => {
    await sendBtcTransaction({
      payload: {
        network: {
          type: network,
        },
        recipients: [
          {
            address: taprootAddress,
            amountSats: 10000n,
          },
        ],
        senderAddress: paymentAddress,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  const onSignTransactionClick = async () => {
    if (utxos.length === 0) {
      alert("No unspent outputs found for payment address");
      return;
    }

    const tx = new btc.Transaction();
    const signingIndexes: number[] = [];

    for (const [index, utxoToSpend] of utxos.entries()) {
      tx.addInput({
        txid: utxoToSpend.txid,
        index: utxoToSpend.vout,
        tapInternalKey: taprootScript.tapInternalKey!,
        tapLeafScript: taprootScript.tapLeafScript!,
        witnessUtxo: {
          script: taprootScript.script!,
          amount: BigInt(utxoToSpend.value),
        },
        sighashType: btc.SigHash.ALL_ANYONECANPAY,
      });

      signingIndexes.push(index);
    }

    tx.addOutputAddress(
      paymentAddress,
      BigInt(taprootBalance) - 500n,
      btc.TEST_NETWORK
    );

    tx.sign(localKey.privateKey!, [btc.SigHash.ALL_ANYONECANPAY]);

    const psbt = tx.toPSBT();
    const psbtBase64 = base64.encode(psbt);

    await signTransaction({
      payload: {
        network: {
          type: network,
        },
        message: "Sign Transaction",
        psbtBase64,
        broadcast: false,
        inputsToSign: [
          {
            address: paymentAddress,
            signingIndexes,
            sigHash: btc.SigHash.ALL_ANYONECANPAY,
          },
        ],
      },
      onFinish: async (response) => {
        const psbt64 = response.psbtBase64;
        const psbt = base64.decode(psbt64);

        const tx = btc.Transaction.fromPSBT(psbt, { allowUnknownInputs: true });

        tx.finalize();

        const res = await fetch("https://mempool.space/testnet/api/tx", {
          method: "POST",
          body: tx.hex,
        });

        alert(tx.id);
        console.log(`https://mempool.space/testnet/tx/${tx.id}`);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  if (network !== BitcoinNetworkType.Testnet) {
    return (
      <div className="container">
        <h3>Complex Taproot PSBT</h3>
        <b>This is only enabled on TESTNET</b>
      </div>
    );
  }

  if (
    !capabilities.has("signTransaction") ||
    !capabilities.has("sendBtcTransaction")
  ) {
    return (
      <div className="container">
        <h3>Complex Taproot PSBT</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Complex Taproot PSBT</h3>
      <p>
        Creates a taproot address from a taproot script requiring two
        signatures; one from a local key and another from the payment address
        key.
      </p>
      <p>
        You can fund the taproot address by clicking the button below. This will
        send 10,000 sats to it.
      </p>
      <p>
        Once funded, you can sign a transaction spending from the taproot
        address returning all the funds back to the payment address, spending
        500 Sats in fees.
      </p>
      <div>
        <p>
          <b>Generated Taproot Address</b>
          <br />
          {taprootAddress}
        </p>
        <p>
          <b>Taproot Address Balance</b>
          <br />
          {taprootBalance}
        </p>
      </div>
      <div>
        <button onClick={onFundClick}>Fund Address</button>
        <br />
        <br />
        <button onClick={onSignTransactionClick} disabled={!taprootBalance}>
          Withdraw funds
        </button>
      </div>
    </div>
  );
};

export default TaprootPsbt;
