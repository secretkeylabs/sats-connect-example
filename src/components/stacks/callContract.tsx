import { BitcoinNetworkType, request } from "sats-connect";

import { useLocalStorage } from "src/useLocalStorage";

const inputDefaults = {
  [BitcoinNetworkType.Mainnet]: {
    contractAddress: "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP",
    contractName: "pox-fast-pool-v2",
    functionName: "allow-contract-caller",
    functionArgs: `[
  "061683ed66860315e334010bbfb76eb3eef887efee0a10706f782d666173742d706f6f6c2d7632",
  "09"
]`,
  },
  [BitcoinNetworkType.Testnet]: {
    contractAddress: "ST000000000000000000002AMW42H",
    contractName: "pox-3",
    functionName: "stack-increase",
    functionArgs: `["0100000000000000000000000000000001"]`,
  },
};

type Props = {
  network: BitcoinNetworkType;
};

function CallContract({ network }: Props) {
  const [contractAddress, setContractAddress] = useLocalStorage<string>(
    `${network}-stx_callContract-contract-address`,
    inputDefaults[network].contractAddress
  );
  const [contractName, setContractName] = useLocalStorage<string>(
    `${network}-stx_callContract-contract-name`,
    inputDefaults[network].contractName
  );
  const [functionName, setFunctionName] = useLocalStorage<string>(
    `${network}-stx_callContract-function-name`,
    inputDefaults[network].functionName
  );
  const [functionArgs, setFunctionArgs] = useLocalStorage<string>(
    `${network}-stx_callContract-arguments`,
    inputDefaults[network].functionArgs
  );

  const handleWebBtcCallContractClick = async () => {
    try {
      const response = await request("stx_callContract", {
        contract: `${contractAddress}.${contractName}`,
        functionName,
        arguments: JSON.parse(functionArgs),
      });
      if (response.status === "success") {
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
