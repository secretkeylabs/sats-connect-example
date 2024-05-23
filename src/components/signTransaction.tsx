import type { Capability } from "sats-connect";
import { BitcoinNetworkType, signTransaction } from "sats-connect";

import * as btc from "@scure/btc-signer";
import { useEffect, useMemo, useState } from "react";
import { UTXO, createPSBT, getUTXOs } from "src/utils";

type Props = {
  network: BitcoinNetworkType;
  paymentAddress: string;
  paymentPublicKey: string;
  capabilities: Set<Capability>;
};

const SignTransaction = ({
  network,
  paymentAddress,
  paymentPublicKey,
  capabilities,
}: Props) => {
  const [recipient, setRecipient] = useState("");
  const [utxos, setUtxos] = useState<UTXO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [psbtBase64, setPsbtBase64] = useState("");
  const [signingIndexes, setSigningIndexes] = useState<number[]>([]);
  const [totalRecoverable, setTotalRecoverable] = useState(0);
  const [feeRate, setFeeRate] = useState("");
  const [utxoLimit, setUtxoLimit] = useState("1000");

  useEffect(() => {
    setIsLoading(true);
    const fetchUTXOs = async () => {
      const utxos = await getUTXOs(network, paymentAddress);
      setUtxos(utxos.filter((utxo) => utxo.status.confirmed));
    };

    fetchUTXOs().finally(() => setIsLoading(false));
  }, [network, paymentAddress]);

  useEffect(() => {
    let recipientValid = false;
    try {
      const networkVal =
        network === BitcoinNetworkType.Testnet ? btc.TEST_NETWORK : btc.NETWORK;
      btc.Address(networkVal).decode(recipient);
      recipientValid = true;
    } catch {
      recipientValid = false;
    }

    if (
      !recipientValid ||
      utxos.length === 0 ||
      !feeRate ||
      Number.isNaN(+feeRate)
    ) {
      setPsbtBase64("");
      setSigningIndexes([]);
      setTotalRecoverable(0);
      return;
    }

    setIsLoading(true);
    const genPsbt = async () => {
      const [psbtBase64, signingIndexes, recoverable] = await createPSBT(
        network,
        paymentAddress,
        paymentPublicKey,
        utxos.slice(0, +utxoLimit),
        recipient,
        +feeRate
      );

      setPsbtBase64(psbtBase64);
      setSigningIndexes(signingIndexes);
      setTotalRecoverable(recoverable);
    };

    genPsbt().finally(() => setIsLoading(false));
  }, [utxos, feeRate, recipient, utxoLimit]);

  const onSignTransactionClick = async () => {
    await signTransaction({
      payload: {
        network: {
          type: network,
        },
        message: "Sign Transaction",
        psbtBase64,
        broadcast: true,
        inputsToSign: [
          {
            address: paymentAddress,
            signingIndexes,
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
  const [totalValue, utxosToUse] = useMemo(() => {
    const toUse = utxos.slice(0, +utxoLimit);
    const total = utxos
      .slice(0, +utxoLimit)
      .reduce((acc, utxo) => acc + utxo.value, 0);
    return [total, toUse];
  }, [utxos, utxoLimit]);

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
      <p>Creates a PSBT sending all UTXOs it can find to the target address.</p>
      <p>
        <b>Source Address:</b> {paymentAddress}
      </p>
      <p>
        <b>Recipient Address:</b>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </p>
      <p>
        <b>Fee Rate:</b>
        <input
          type="number"
          value={feeRate}
          onChange={(e) => setFeeRate(e.target.value)}
        />
      </p>
      <p>
        <b>Txn UTXO limit:</b>
        <input
          type="number"
          value={utxoLimit}
          onChange={(e) => setUtxoLimit(e.target.value)}
        />
      </p>
      {isLoading && (
        <>
          <div style={{ color: "green", fontWeight: "bold" }}>
            Loading UTXOs... This may take a while.
          </div>
          <br />
        </>
      )}
      {!isLoading && (
        <div>
          <h4>UTXOs</h4>
          <p>
            Total Count: <b>{utxos.length}</b>
          </p>
          <p>
            To Use Count: <b>{utxosToUse.length}</b>
          </p>
          <p>
            To Use Value: <b>{totalValue} sats</b>
          </p>
          <p>
            Recoverable Value: <b>{totalRecoverable} sats</b>
          </p>
        </div>
      )}
      <div>
        <button onClick={onSignTransactionClick} disabled={!psbtBase64}>
          Sign Transaction
        </button>
      </div>
    </div>
  );
};

export default SignTransaction;
