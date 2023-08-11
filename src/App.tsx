import { useState } from "react";

import { AddressPurpose, BitcoinNetworkType, getAddress } from "sats-connect";

import SendBitcoin from "./components/sendBitcoin";
import SignMessage from "./components/signMessage";
import SignTransaction from "./components/signTransaction";

import "./App.css";

function App() {
  const [paymentAddress, setPaymentAddress] = useState<string | undefined>();
  const [paymentPublicKey, setPaymentPublicKey] = useState<
    string | undefined
  >();
  const [ordinalsAddress, setOrdinalsAddress] = useState<string | undefined>();
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useState<
    string | undefined
  >();
  const [network, setNetwork] = useState(BitcoinNetworkType.Testnet);

  const isReady =
    !!paymentAddress &&
    !!paymentPublicKey &&
    !!ordinalsAddress &&
    !!ordinalsPublicKey;

  const toggleNetwork = () => {
    setNetwork(
      network === BitcoinNetworkType.Testnet
        ? BitcoinNetworkType.Mainnet
        : BitcoinNetworkType.Testnet
    );
    setPaymentAddress(undefined);
    setPaymentPublicKey(undefined);
    setOrdinalsAddress(undefined);
    setOrdinalsPublicKey(undefined);
  };

  const onConnectClick = async () => {
    await getAddress({
      payload: {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: "SATS Connect Demo",
        network: {
          type: network,
        },
      },
      onFinish: (response) => {
        const paymentAddressItem = response.addresses.find(
          (address) => address.purpose === AddressPurpose.Payment
        );
        setPaymentAddress(paymentAddressItem?.address);
        setPaymentPublicKey(paymentAddressItem?.publicKey);

        const ordinalsAddressItem = response.addresses.find(
          (address) => address.purpose === AddressPurpose.Ordinals
        );
        setOrdinalsAddress(ordinalsAddressItem?.address);
        setOrdinalsPublicKey(ordinalsAddressItem?.publicKey);
      },
      onCancel: () => alert("Request canceled"),
    });
  };

  if (!isReady) {
    return (
      <div style={{ padding: 30 }}>
        <h1>Sats Connect Test App - {network}</h1>
        <div>Please connect your wallet to continue</div>

        <div style={{ background: "lightgray", padding: 30, marginTop: 10 }}>
          <button style={{ height: 30, width: 180 }} onClick={toggleNetwork}>
            Switch Network
          </button>
          <br />
          <br />
          <button style={{ height: 30, width: 180 }} onClick={onConnectClick}>
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Sats Connect Test App</h1>
      <div>
        {paymentAddress && <div>Payment Address: {paymentAddress}</div>}
        {ordinalsAddress && <div>Ordinals Address: {ordinalsAddress}</div>}

        <SignTransaction
          paymentAddress={paymentAddress}
          paymentPublicKey={paymentPublicKey}
          ordinalsAddress={ordinalsAddress}
          ordinalsPublicKey={ordinalsPublicKey}
          network={network}
        />

        <SignMessage address={ordinalsAddress} network={network} />

        <SendBitcoin address={paymentAddress} network={network} />
      </div>
    </div>
  );
}

export default App;
