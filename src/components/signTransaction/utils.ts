import { BitcoinNetworkType } from "sats-connect";
import { getUTXOs, createPSBT } from "src/utils";

export async function createTransaction({
  network,
  paymentAddress,
  ordinalsAddress,
  paymentPublicKey,
  ordinalsPublicKey,
}: {
  network: BitcoinNetworkType;
  paymentAddress: string;
  ordinalsAddress: string;
  paymentPublicKey: string;
  ordinalsPublicKey: string;
}): Promise<[Error, null] | [null, string]> {
  const [paymentUnspentOutputs, ordinalsUnspentOutputs] = await Promise.all([
    getUTXOs(network, paymentAddress),
    getUTXOs(network, ordinalsAddress),
  ]);

  if (paymentUnspentOutputs.length === 0) {
    const errorMessage = "No unspent outputs found for payment address";
    alert(errorMessage);
    return [new Error(errorMessage), null];
  }

  if (ordinalsUnspentOutputs.length === 0) {
    const errorMessage = "No unspent outputs found for ordinals address";
    alert(errorMessage);
    return [new Error(errorMessage), null];
  }

  // create psbt sending from payment address to ordinals address
  const outputRecipient1 = ordinalsAddress;
  const outputRecipient2 = paymentAddress;

  const psbtBase64 = await createPSBT(
    network,
    paymentPublicKey,
    ordinalsPublicKey,
    paymentUnspentOutputs,
    ordinalsUnspentOutputs,
    outputRecipient1,
    outputRecipient2
  );

  return [null, psbtBase64];
}
