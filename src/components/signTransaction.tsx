import type { Capability } from "sats-connect";
import { BitcoinNetworkType, signTransaction } from "sats-connect";

import * as btc from "@scure/btc-signer";

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
  ordinalsPublicKey,
  capabilities,
}: Props) => {
  const onSignTransactionClick = async () => {
    const [paymentUnspentOutputs, ordinalsUnspentOutputs] = await Promise.all([
      getUTXOs(network, paymentAddress),
      getUTXOs(network, ordinalsAddress),
    ]);

    let canContinue = true;

    if (paymentUnspentOutputs.length === 0) {
      alert("No unspent outputs found for payment address");
      canContinue = false;
    }

    if (ordinalsUnspentOutputs.length === 0) {
      alert("No unspent outputs found for ordinals address");
      canContinue = false;
    }

    if (!canContinue) {
      return;
    }

    // create psbt sending from payment address to ordinals address
    const outputRecipient1 = ordinalsAddress;
    const outputRecipient2 = paymentAddress;

    const psbtBase64 = await createPSBT(
      network,
      paymentPublicKey,
      ordinalsPublicKey,
      paymentUnspentOutputs,
      ordinalsUnspentOutputs,
      outputRecipient1,
      outputRecipient2
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
          {
            address: ordinalsAddress,
            signingIndexes: [1],
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
        <button onClick={onSignTransactionClick}>Sign Transaction</button>
      </div>
    </div>
  );
};

export default SignTransaction;
