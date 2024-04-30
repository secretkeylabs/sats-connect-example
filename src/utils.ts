import { BitcoinNetworkType } from "sats-connect";

export type UTXO = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
};

export const getUTXOs = async (
  network: BitcoinNetworkType,
  address: string
): Promise<UTXO[]> => {
  const networkSubpath =
    network === BitcoinNetworkType.Testnet ? "/testnet" : "";

  const url = `https://mempool.space${networkSubpath}/api/address/${address}/utxo`;
  const response = await fetch(url);

  return response.json();
};

export type UtxoRunes = {
  txid: string;
  vout: number;
  value: number;
  runes: [runeName: string, detail: { amount: number }][];
};

export const getUtxosWithRuneBalances = async (
  network: BitcoinNetworkType,
  address: string
): Promise<UtxoRunes[]> => {
  const baseUrl =
    network === BitcoinNetworkType.Testnet
      ? "https://api-testnet.xverse.app/"
      : "https://api-3.xverse.app/";

  let results: UtxoRunes[] = [];
  let offset = 0;
  let total = 1;
  while (offset < total) {
    const ordinalUtxos = await fetch(
      baseUrl + "v2/address/" + address + "/ordinal-utxo/?offset=" + offset,
      { headers: { Accept: "application/json" } }
    );

    const data = await ordinalUtxos.json();

    results = [...results, ...data.results];
    offset += data.results.length;
    total = data.total;
  }

  return results;
};
