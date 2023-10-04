import type { Capability } from "sats-connect";
import { BitcoinNetworkType, signTransaction } from "sats-connect";

import * as btc from "@scure/btc-signer";

import { useState } from "react";
import { createPSBT, getUTXOs } from "../utils";

type Props = {
  network: BitcoinNetworkType;
  ordinalsAddress: string;
  paymentAddress: string;
  paymentPublicKey: string;
  ordinalsPublicKey: string;
  capabilities: Set<Capability>;
};

const SignTransaction = ({
  network,
  ordinalsAddress,
  paymentAddress,
  paymentPublicKey,
  capabilities,
}: Props) => {
  const [address, setAddress] = useState<string>(
    "36yfYrSP4nMjLJNgtrbQwDUcw1WexjoexG"
  );
  const [txid, setTxid] = useState<string>(
    "812976ea8c14174a68e9605de40ee6438fb47ae7b43ba2d59af938211b4e194a"
  );
  const [vout, setVout] = useState<string>("1");

  const onSignTransactionClick = async () => {
    const paymentUnspentOutputs = await getUTXOs(network, address);

    const utxo = paymentUnspentOutputs.find(
      (utxo) => utxo.txid === txid && utxo.vout === parseInt(vout)
    );

    if (!utxo) {
      alert("UTXO not found");
      return;
    }

    // create psbt sending from payment address to ordinals address
    const outputRecipient1 = ordinalsAddress;

    const psbtBase64 = await createPSBT(
      network,
      paymentPublicKey,
      utxo,
      outputRecipient1
    );

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
            signingIndexes: [0],
            sigHash: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
          },
        ],
      },
      onFinish: (response) => {
        alert(response.psbtBase64);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  if (!capabilities.has("signTransaction")) {
    return (
      <div className="container">
        <h3>Sign transaction</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Sign transaction</h3>
      <p>
        Creates a PSBT sending the first UTXO from each of the payment and
        ordinal addresses to the other address, with the change going to the
        payment address.
      </p>
      <div>
        Address:
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        Txid:
        <input value={txid} onChange={(e) => setTxid(e.target.value)} />
      </div>
      <div>
        VOUT:
        <input
          value={vout}
          onChange={(e) => setVout(e.target.value)}
          type="number"
        />
      </div>
      <div>
        <button onClick={onSignTransactionClick}>Sign Transaction</button>
      </div>
    </div>
  );
};

export default SignTransaction;
