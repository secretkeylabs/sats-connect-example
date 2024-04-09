import type { Capability } from "sats-connect";
import Wallet, {
  BitcoinNetworkType,
  RpcErrorCode,
  request,
  signTransaction,
} from "sats-connect";

import * as btc from "@scure/btc-signer";
import { createTransaction } from "./utils";

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
    const [error, psbtBase64] = await createTransaction({
      network,
      paymentAddress,
      ordinalsAddress,
      paymentPublicKey,
      ordinalsPublicKey,
    });

    if (error) {
      alert("Error creating transaction. Check console for error logs");
      console.error(error);
      return;
    }

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

  const onSignTransactionRPC = async () => {
    const [error, psbtBase64] = await createTransaction({
      network,
      paymentAddress,
      ordinalsAddress,
      paymentPublicKey,
      ordinalsPublicKey,
    });

    if (error) {
      alert("Error creating transaction. Check console for error logs");
      console.error(error);
      return;
    }

    try {
      const response = await Wallet.request("signPsbt", {
        psbt: psbtBase64,
        allowedSignHash: btc.SigHash.SINGLE | btc.SigHash.DEFAULT_ANYONECANPAY,
        signInputs: {
          [paymentAddress]: [0],
          [ordinalsAddress]: [1],
        },
      });
      if (response.status === "success") {
        console.log(response);
        alert(response.result.psbt);
      } else {
        const error = response;
        console.log(error);
        if (error.error.code === RpcErrorCode.USER_REJECTION) {
          alert("Canceled");
        } else {
          alert(error.error.message);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

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
        <button onClick={onSignTransactionRPC}>Sign Transaction RPC</button>
      </div>
    </div>
  );
};

export default SignTransaction;
