import { request } from "sats-connect";
import { useLocalStorage } from "src/useLocalStorage";

type Props = {
  address: string;
};

const TransferSTX = ({ address }: Props) => {
  const [recipient, setRecipient] = useLocalStorage<string>(
    "stx_transferSTx-recipient",
    ""
  );
  const [amount, setAmount] = useLocalStorage<string>(
    "stx_transferSTx-amount",
    ""
  );
  const [memo, setMemo] = useLocalStorage<string>("stx_transferSTx-memo", "");

  const onTransferSTX = async () => {
    try {
      console.log("[ARY]: transfer");
      const response = await request("stx_transferStx", {
        recipient,
        amount: Number(amount),
        memo,
      });
      if ("result" in response) {
        alert(response.result.txid);
      } else {
        alert(response.error.message);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
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
