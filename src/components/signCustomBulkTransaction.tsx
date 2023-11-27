import type { Capability } from "sats-connect";
import { BitcoinNetworkType, signMultipleTransactions } from "sats-connect";

import * as btc from "@scure/btc-signer";

import { createBtcPSBT, getUTXOs } from "../utils";

type Props = {
  network: BitcoinNetworkType;
  paymentAddress: string;
  paymentPublicKey: string;
  capabilities: Set<Capability>;
};

const SignCustomBulkTransaction = ({
  network,
  paymentAddress,
  paymentPublicKey,
  capabilities,
}: Props) => {
  const onSignCustomBulkTransactionClick = async () => {
    const paymentUnspentOutputs = await getUTXOs(network, paymentAddress);

    if (paymentUnspentOutputs.length === 0) {
      alert("No unspent outputs found for payment address");
      return;
    }

    // create psbt sending from payment address to themself

    const psbtsBase64 = [];
    console.log('all UTXOs', paymentUnspentOutputs);
    const filteredUnspentOutputs = paymentUnspentOutputs.filter((utxo) => utxo.value >= 800);
    console.log('filtered UTXOs', filteredUnspentOutputs);

    const PSBTS_TO_CREATE = 100;

    for (let i = 0; i < PSBTS_TO_CREATE; i++) {
      psbtsBase64.push(await createBtcPSBT(
        network,
        paymentPublicKey,
        filteredUnspentOutputs.slice(i),
        paymentAddress,
      ));
    }

    const psbts = psbtsBase64.map(psbtBase64 => ({
      psbtBase64,
      inputsToSign: [
        {
          address: paymentAddress,
          signingIndexes: [0],
          sigHash: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
        },
      ],
    }));

    console.log('Signing this psbts:', psbts);

    await signMultipleTransactions({
      payload: {
        network: {
          type: network,
        },
        message: "Sign Transaction",
        psbts
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
      <h3>Sign custom bulk transaction</h3>
      <p>
        Creates a number of PSBTs, with the change going to the payment address.
      </p>
      <div>
        <button onClick={onSignCustomBulkTransactionClick}>Sign Custom Bulk Tx</button>
      </div>
    </div>
  );
};

export default SignCustomBulkTransaction;
