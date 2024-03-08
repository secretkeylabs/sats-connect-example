import { request } from "sats-connect";

function GetAccounts() {
  async function handleGetAccountsClick() {
    const response = await request("stx_getAccounts", {});

    if (response.status === "success") {
      alert("Success getting accounts. Check console for results.");
      console.log("Accounts:", response.result);
    } else {
      alert("Error getting accounts. Check console for details.");
      console.error(response);
    }
  }

  return (
    <div className="container">
      <h3>Get accounts</h3>

      <button onClick={handleGetAccountsClick}>Get accounts</button>
    </div>
  );
}

export default GetAccounts;
