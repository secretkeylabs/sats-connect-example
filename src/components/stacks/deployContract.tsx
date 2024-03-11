import { BitcoinNetworkType, request } from "sats-connect";
import { code } from "./contractCode";
import { useLocalStorage } from "src/useLocalStorage";

interface Props {
  network: BitcoinNetworkType;
}
const errorMessage = "Error signing transaction. Check console for error logs.";

function SignTransaction({ network }: Props) {
  const [contractName, setContractName] = useLocalStorage<string>(
    `${network}-stx_deployContract-contract-name`,
    ""
  );
  const [clarityCode, setClarityCode] = useLocalStorage<string>(
    `${network}-stx_deployContract-clarity-code`,
    code
  );

  const handleSignTransactionContractDeployClick = async () => {
    try {
      const response = await request("stx_deployContract", {
        clarityCode,
        name: contractName,
      });
      if (response.status === "success") {
        alert("Success. Check console for response");
        console.log(response.result);
      } else {
        alert(errorMessage);
        console.error(response.error);
      }
    } catch (error) {
      alert(errorMessage);
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h3>Deploy contract</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <label>
          <div>Contract name:</div>
          <input
            type="text"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
          />
        </label>
        <label>
          <div>Clarity code:</div>
          <textarea
            value={clarityCode}
            onChange={(e) => setClarityCode(e.target.value)}
          />
        </label>
        <button
          style={{ width: "20rem" }}
          onClick={handleSignTransactionContractDeployClick}
        >
          Deploy contract
        </button>
      </div>
    </div>
  );
}

export default SignTransaction;
