import { cvToHex, stringAsciiCV, tupleCV, uintCV } from "@stacks/transactions";
import { BitcoinNetworkType, request } from "sats-connect";

/**
 * Values taken from
 * https://github.com/stacksgov/sips/blob/main/sips/sip-018/sip-018-signed-structured-data.md#typescript-implementation
 */
const chainIds = {
  [BitcoinNetworkType.Mainnet]: 1,
  [BitcoinNetworkType.Testnet]: 2147483648,
};

interface Props {
  network: BitcoinNetworkType.Testnet | BitcoinNetworkType.Mainnet;
}
export function SignStructuredMessage({ network }: Props) {
  const onMessagingSigningClicked = async () => {
    const response = await request("stx_signStructuredMessage", {
      message: cvToHex(tupleCV({ hello: stringAsciiCV("world") })).slice(2), // remove 0x,
      domain: cvToHex(
        tupleCV({
          name: stringAsciiCV("sats-connect-example"),
          version: stringAsciiCV("1.2.3"),
          "chain-id": uintCV(chainIds[network]),
        })
      ).slice(2),
    });
    if (response.status === "success") {
      alert("Success! Check the console for the response.");
      console.log(response.result);
    } else {
      console.error(
        "Something went wrong. Check the console for the response."
      );
      console.error(response);
    }
  };

  return (
    <div style={{ background: "lightgray", padding: 30, margin: 10 }}>
      <button
        style={{ height: 30, width: 200 }}
        onClick={onMessagingSigningClicked}
      >
        Sign structured message
      </button>
    </div>
  );
}

export default SignStructuredMessage;
