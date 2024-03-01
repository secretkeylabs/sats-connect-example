import { RpcErrorCode, request } from "sats-connect";
import { useState } from "react";
import type { Capability, RpcErrorResponse } from "sats-connect";
import { BitcoinNetworkType, signMessage } from "sats-connect";

type Props = {
  network: BitcoinNetworkType;
  address: string;
  capabilities: Set<Capability>;
};

const SignMessage = ({ network, address, capabilities }: Props) => {
  const [message, setMessage] = useState("Hello World!");

  const onSignMessageClick = async () => {
    if (!address) return alert("Address is required");

    await signMessage({
      payload: {
        network: {
          type: network,
        },
        address,
        message,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  const onSignMessageRpcClick = async () => {
    try {
      const response = await request("signMessage", {
        address,
        message,
      });
      alert(response.result.signature);
    } catch (err) {
      if (
        (err as RpcErrorResponse).error.code === RpcErrorCode.USER_REJECTION
      ) {
        alert(err.error.message);
      }
    }
  };

  if (!capabilities.has("signMessage")) {
    return (
      <div className="container">
        <h3>Sign message</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  const signingDisabled = message.length === 0;

  return (
    <div className="container">
      <h3>Sign message</h3>
      <p>
        <b>Address</b>
        <br />
        {address}
      </p>
      <b>Message</b>
      <br />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <br />
      <div>
        <button onClick={onSignMessageClick} disabled={signingDisabled}>
          Sign message
        </button>
        <button onClick={onSignMessageRpcClick} disabled={signingDisabled}>
          Sign message RPC
        </button>
      </div>
    </div>
  );
};

export default SignMessage;
