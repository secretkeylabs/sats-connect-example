import { request } from "sats-connect";

function GetAddresses() {
  async function handleGetAddressesClick() {
    const response = await request("stx_getAddresses", null);

    if (response.status === "success") {
      alert("Success getting addresses. Check console for results.");
      console.log("Addresses:", response.result);
    } else {
      alert("Error getting addresses. Check console for details.");
      console.error(response);
    }
  }

  return (
    <div className="container">
      <h3>Get addresses</h3>

      <button onClick={handleGetAddressesClick}>Get addresses</button>
    </div>
  );
}

export default GetAddresses;
