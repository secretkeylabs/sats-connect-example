import { isRpcSuccessResponse, request } from "sats-connect";
import {
  contractPrincipalCV,
  makeUnsignedContractCall,
} from "@stacks/transactions";
import { useState } from "react";
import { uint8ArrayToHex } from "./helpers";

interface Props {
  publicKey: string;
}
function SignTransaction(props: Props) {
  const [contractAddress, setContractAddress] = useState(
    "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP"
  );
  const [contractName, setContractName] = useState("pox-fast-pool-v2");
  const [functionName, setFunctionName] = useState("allow-contract-caller");
  const [functionArgs, setFunctionArgs] = useState("[]");

  const handleLegacySignTransactionClick = async () => {
    // TODO
  };

  const handleWebBtcSignTransactionContractCallClick = async () => {
    const transaction = await makeUnsignedContractCall({
      anchorMode: "onChainOnly",
      contractAddress: "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP",
      contractName: "pox-fast-pool-v2",
      functionName: "allow-contract-caller",
      functionArgs: [
        contractPrincipalCV(
          "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP",
          "pox-fast-pool-v2"
        ),
      ],
      publicKey: props.publicKey,
    });
    try {
      const response = await request("stx_signTransaction", {
        transaction: uint8ArrayToHex(transaction.serialize()),
      });
      if (isRpcSuccessResponse(response)) {
        console.log(response.result.transaction);
      } else {
        console.error(response.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="container">
      <h3>Sign transaction</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <label>
          <div>Contract address:</div>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </label>
        <label>
          <div>Contract name:</div>
          <input
            type="text"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
          />
        </label>
        <label>
          <div>Function name:</div>
          <input
            type="text"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
          />
        </label>
        <label>
          <div>Function args (JSON array of hex values):</div>
          <input
            type="text"
            value={functionArgs}
            onChange={(e) => setFunctionArgs(e.target.value)}
          />
        </label>
      </div>
      <div>
        <button
          style={{ width: "20rem" }}
          onClick={handleWebBtcSignTransactionContractCallClick}
        >
          WebBTC Sign Transaction (contract call)
        </button>
      </div>
    </div>
  );
}

export default SignTransaction;
