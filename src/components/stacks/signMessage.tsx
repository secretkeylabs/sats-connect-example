import { BitcoinNetworkType, request } from "sats-connect";
import { useLocalStorage } from "src/useLocalStorage";

interface Props {
  network: BitcoinNetworkType;
}
const StacksSignMessage = ({ network }: Props) => {
  const [message, setMessage] = useLocalStorage<string>(
    `${network}-stx_signMessage`,
    "Hello world 123"
  );

  const onMessagingSigningClicked = async () => {
    const message = "Hello World 123";
    const response = await request("stx_signMessage", {
      message,
    });
    if (response.status === "success") {
      alert("Success! Check the console for the response.");
      console.log(response);
    } else {
      alert("Something went wrong. Check the console for the response.");
      console.error(response);
    }
  };
  return (
    <div style={{ background: "lightgray", padding: 30, margin: 10 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <label>
          <div>Message:</div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <button
          style={{ height: 30, width: 200 }}
          onClick={onMessagingSigningClicked}
        >
          Sign message
        </button>
      </div>
    </div>
  );
};

export default StacksSignMessage;
