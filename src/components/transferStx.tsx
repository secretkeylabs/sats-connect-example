import { useState } from "react";
import { BitcoinNetworkType, request } from "sats-connect";

type Props = {
  network: BitcoinNetworkType;
  address: string;
};

const TransferSTX = ({ network, address }: Props) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const onTransferSTX = async () => {
    try {
      const response = await request("stx_transferStx", {
        recipient,
        amount: Number(amount),
        memo,
      });
      alert(response.result.txid);
    } catch (err) {
      alert(err.error.message);
    }
  };

  const sendDisabled = recipient.length === 0;

  return (
    <div className="container">
      <h3>Send STX</h3>
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
        <b>Send amount (Microstacks)</b>
        <br />
        <input
          type="number"
          value={amount.toString()}
          onChange={(e) => setAmount(e.target.value)}
        />
      </p>
      <p>
        <b>Memo</b>
        <br />
        <input value={memo} onChange={(e) => setMemo(e.target.value)} />
      </p>
      <button onClick={onTransferSTX} disabled={sendDisabled}>
        Transfer STX
      </button>
    </div>
  );
};

export default TransferSTX;
