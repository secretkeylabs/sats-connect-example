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
  capabilities,
}: Props) => {
  const onSignTransactionClick = async (
    address: string,
    txid: string,
    vout: number
  ) => {
    const paymentUnspentOutputs = await getUTXOs(network, address);

    const utxo = paymentUnspentOutputs.find(
      (utxo) => utxo.txid === txid && utxo.vout === vout
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
        <button
          onClick={() =>
            onSignTransactionClick(
              "36yfYrSP4nMjLJNgtrbQwDUcw1WexjoexG",
              "812976ea8c14174a68e9605de40ee6438fb47ae7b43ba2d59af938211b4e194a",
              1
            )
          }
        >
          Uncommon
        </button>
        <button
          onClick={() =>
            onSignTransactionClick(
              "3839RmQBVqdnSwHQfSvPZZvcZTbdUmaf47",
              "b9a77539594cbf310c454dd89da3f1fbfeca30e25406b237da72e598b7e3e38c",
              0
            )
          }
        >
          Rare
        </button>
        <button
          onClick={() =>
            onSignTransactionClick(
              "1FC5pgkk2SQx5P9qiuAjL6x29bbZHBRzHN",
              "817081e1e0574ca5352037769b99cdd826eeebec4d9f79e94d6bdefda4e6776e",
              0
            )
          }
        >
          Epic
        </button>
        <button
          onClick={() =>
            onSignTransactionClick(
              "bc1p5dmqqdmxkzfu7xnatft3qgkj9jzf47zxjuwa4ggws0m3vaa6ypmqa5p8h0",
              "26293afd5599c4ca846afd3c45547315d71950afae94c265057305dae1fd7233",
              0
            )
          }
        >
          Inscribed Common/unknown
        </button>
      </div>
    </div>
  );
};

export default SignTransaction;
