import { isRpcSuccessResponse, request } from "sats-connect";

import { useState } from "react";
import { useLocalStorage } from "src/useLocalStorage";

function CallContract() {
  const [contractAddress, setContractAddress] = useState(
    "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP"
  );
  const [contractName, setContractName] = useLocalStorage<string>(
    "stx_callContract-contract-name",
    "pox-fast-pool-v2"
  );
  const [functionName, setFunctionName] = useLocalStorage<string>(
    "stx_callContract-function-name",
    "allow-contract-caller"
  );
  const [functionArgs, setFunctionArgs] = useLocalStorage<string>(
    "stx_callContract-arguments",
    `[
  "061683ed66860315e334010bbfb76eb3eef887efee0a10706f782d666173742d706f6f6c2d7632",
  "09"
]`
  );

  const handleWebBtcCallContractClick = async () => {
    try {
      const response = await request("stx_callContract", {
        contract: `${contractAddress}.${contractName}`,
        functionName,
        arguments: JSON.parse(functionArgs),
      });
      if (isRpcSuccessResponse(response)) {
        console.log(response.result);
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <div className="container">
      <h3>Call contract</h3>
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
          <textarea
            value={functionArgs}
            onChange={(e) => setFunctionArgs(e.target.value)}
          />
        </label>
        <button onClick={handleWebBtcCallContractClick}>
          WebBTC Call Contract
        </button>
      </div>
    </div>
  );
}

export default CallContract;
