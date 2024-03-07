import {
  BitcoinNetworkType,
  isRpcSuccessResponse,
  request,
} from "sats-connect";
import {
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  uintCV,
} from "@stacks/transactions";
import { useState } from "react";
import { uint8ArrayToHex } from "./helpers";
import { code } from "./contractCode";

interface Props {
  network: BitcoinNetworkType;
  publicKey: string;
}
const errorMessage = "Error signing transaction. Check console for error logs.";

function SignTransaction(props: Props) {
  const handleSignTransactionContractCallClick = async () => {
    const transaction = await makeUnsignedContractCall({
      fee: 3000,
      anchorMode: "onChainOnly",
      contractAddress: "SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP",
      contractName: "pox-fast-pool-v2",
      functionName: "set-stx-buffer",
      functionArgs: [uintCV(1)],
      publicKey: props.publicKey,
    });
    try {
      const response = await request("stx_signTransaction", {
        transaction: uint8ArrayToHex(transaction.serialize()),
      });
      if (isRpcSuccessResponse(response)) {
        console.log(response.result.transaction);
      } else {
        alert(errorMessage);
        console.error(response.error);
      }
    } catch (error) {
      alert(errorMessage);
      console.error(error);
    }
  };

  const handleSignTransactionSTXTokenTransferClick = async () => {
    const transaction = await makeUnsignedSTXTokenTransfer({
      anchorMode: "any",
      fee: 3000,
      recipient: "SP2FFKDKR122BZWS7GDPFWC0J0FK4WMW5NPQ0Z21M", // account 4
      amount: 1000,
      publicKey: props.publicKey,
    });
    try {
      const response = await request("stx_signTransaction", {
        transaction: uint8ArrayToHex(transaction.serialize()),
      });
      if (isRpcSuccessResponse(response)) {
        console.log(response.result.transaction);
      } else {
        alert(errorMessage);
        console.error(response.error);
      }
    } catch (error) {
      alert(errorMessage);
      console.error(error);
    }
  };

  const handleSignTransactionContractDeployClick = async () => {
    const transaction = await makeUnsignedContractDeploy({
      anchorMode: "any",
      contractName: "my-contract",
      codeBody: code,
      fee: 3000,
      publicKey: props.publicKey,
    });
    try {
      const response = await request("stx_signTransaction", {
        transaction: uint8ArrayToHex(transaction.serialize()),
      });
      if (isRpcSuccessResponse(response)) {
        console.log(response.result.transaction);
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
      <h3>Sign transaction</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          style={{ width: "20rem" }}
          onClick={handleSignTransactionSTXTokenTransferClick}
        >
          WebBTC Sign Transaction (token transfer)
        </button>
        <button
          style={{ width: "20rem" }}
          onClick={handleSignTransactionContractCallClick}
        >
          WebBTC Sign Transaction (contract call)
        </button>
        <button
          style={{ width: "20rem" }}
          onClick={handleSignTransactionContractDeployClick}
        >
          WebBTC Sign Transaction (contract deploy)
        </button>
      </div>
    </div>
  );
}

export default SignTransaction;
