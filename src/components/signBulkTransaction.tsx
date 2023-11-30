import type { Capability } from "sats-connect";
import { BitcoinNetworkType, signMultipleTransactions } from "sats-connect";

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

const SignBulkTransaction = ({
  network,
  ordinalsAddress,
  paymentAddress,
  paymentPublicKey,
  ordinalsPublicKey,
  capabilities,
}: Props) => {
  const onSignBulkTransactionClick = async () => {
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

    if (paymentUnspentOutputs.length < 3) {
      alert("Not enough unspent outputs found for payment address");
      canContinue = false;
    }

    if (ordinalsUnspentOutputs.length < 3) {
      alert("Not enough unspent outputs found for ordinals address");
      canContinue = false;
    }
                                        
    if (!canContinue) {
      return;
    }

    // create psbt sending from payment address to ordinals address
    const outputRecipient1 = ordinalsAddress;
    const outputRecipient2 = paymentAddress;

    const psbtsBase64 = [await createPSBT(
      network,
      paymentPublicKey,
      ordinalsPublicKey,
      paymentUnspentOutputs,
      ordinalsUnspentOutputs,
      outputRecipient1,
      outputRecipient2
    ), await createPSBT(
      network,
      paymentPublicKey,
      ordinalsPublicKey,
      paymentUnspentOutputs.slice(1),
      ordinalsUnspentOutputs.slice(1),
      outputRecipient1,
      outputRecipient2
    ), await createPSBT(
      network,
      paymentPublicKey,
      ordinalsPublicKey,
      paymentUnspentOutputs.slice(2),
      ordinalsUnspentOutputs.slice(2),
      outputRecipient1,
      outputRecipient2
    )];

    await signMultipleTransactions({
      payload: {
        network: {
          type: network,
        },
        message: "Sign Transaction",
        psbts: [
          {
            psbtBase64: psbtsBase64[0],
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
          {
            psbtBase64: psbtsBase64[1],
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
          {
            psbtBase64: psbtsBase64[2],
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
          }
        ]
      },
      onFinish: (response) => {
        console.log('Bulk tx signing response:', response);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  if (!capabilities.has("signMultipleTransactions")) {
    return (
      <div className="container">
        <h3>Sign transaction</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Sign bulk transaction</h3>
      <p>
        Creates a PSBT sending the first, second and third UTXO from each of the payment and
        ordinal addresses to the other address, with the change going to the
        payment address.
      </p>
      <div>
        <button onClick={onSignBulkTransactionClick}>Sign Bulk Transaction</button>
      </div>
    </div>
  );
};

export default SignBulkTransaction;
