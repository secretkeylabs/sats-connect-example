import { useState } from "react";

import { BitcoinNetworkType, sendBtcTransaction } from "sats-connect";

type Props = {
  network: BitcoinNetworkType;
  address: string;
};

const SendBitcoin = ({ network, address }: Props) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0n);

  const onSendBtcClick = async () => {
    await sendBtcTransaction({
      payload: {
        network: {
          type: network,
        },
        recipients: [
          {
            address: recipient,
            amountSats: amount,
          },
          // you can add more recipients here
        ],
        senderAddress: address!,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  if (network !== BitcoinNetworkType.Testnet)
    return (
      <div className="container">
        <h3>Send Bitcoin</h3>
        <div>Only available on testnet</div>
      </div>
    );

  const sendDisabled = recipient.length === 0;

  return (
    <div className="container">
      <h3>Send Bitcoin</h3>
      <p>
        <b>From address</b>
        <br />
        {address}
      </p>
      <p>
        <b>Recipient address</b>
        <br />
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </p>
      <p>
        <b>Send amount</b>
        <br />
        <input
          type="number"
          value={amount.toString()}
          onChange={(e) => setAmount(BigInt(e.target.value))}
        />
      </p>
      <button onClick={onSendBtcClick} disabled={sendDisabled}>
        Send BTC Transaction
      </button>
    </div>
  );
};

export default SendBitcoin;
