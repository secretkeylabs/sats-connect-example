import type { Capability } from "sats-connect";
import { BitcoinNetworkType, signTransaction } from "sats-connect";

import * as btc from "@scure/btc-signer";
import { useState } from "react";

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
  const [psbtBase64, setPsbt] = useState("");
  const [broadcast, setBroadcast] = useState(false);

  const onSignTransactionClick = async () => {
    if (!psbtBase64) return;
    await signTransaction({
      payload: {
        network: {
          type: network,
        },
        message: "Sign Transaction",
        psbtBase64,
        broadcast,
        inputsToSign: [
          {
            address: ordinalsAddress,
            signingIndexes: [0],
            sigHash: btc.SigHash.ALL,
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
      <p>Sign a PSBT. This will open the confirmation dialog in the wallet.</p>
      <div>
        <label>PSBT</label>
        <input
          type="text"
          value={psbtBase64}
          onChange={(e) => setPsbt(e.target.value)}
        />
      </div>
      <div>
        <label>Broadcast</label>
        <input
          type="checkbox"
          checked={broadcast}
          onChange={() => setBroadcast(!broadcast)}
        />
      </div>
      <br />
      <div>
        <button onClick={onSignTransactionClick}>Sign Transaction</button>
      </div>
    </div>
  );
};

export default SignTransaction;
