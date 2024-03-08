import { request } from "sats-connect";

const StacksSignMessage = () => {
  const onMessagingSigningClicked = async () => {
    const message = "Hello World 123";
    const response = await request("stx_signMessage", {
      message,
    });
    if (response.status === "success") {
      console.log(response);
      alert(response.result.signature);
    }
  };
  return (
    <div style={{ background: "lightgray", padding: 30, margin: 10 }}>
      <button
        style={{ height: 30, width: 200 }}
        onClick={onMessagingSigningClicked}
      >
        Call Signature Request
      </button>
    </div>
  );
};

export default StacksSignMessage;
