import React from "react";
import { getAddress, signTransaction, signMessage, sendBtcTransaction  } from "sats-connect";
import * as btc from '@scure/btc-signer';
import { hex, base64 } from '@scure/base'

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentAddress: "",
      paymentPublicKey: "",
      ordinalsAddress: "",
      ordinalsPublicKey: "",
    };
  }

  onConnectClick = async () => {
    const getAddressOptions = {
      payload: {
        purposes: ["ordinals", "payment"],
        message: "Address for receiving Ordinals",
        network: {
          type: "Testnet",
        },
      },
      onFinish: (response) => {
        this.setState({
          ordinalsAddress: response.addresses[0].address,
          paymentAddress: response.addresses[1].address,
          ordinalsPublicKey: response.addresses[0].publicKey,
          paymentPublicKey: response.addresses[1].publicKey,
        });
      },
      onCancel: () => alert("Request canceled"),
    };
    await getAddress(getAddressOptions);
  };

  getUnspent = async (address) => {
    const url = `https://mempool.space/testnet/api/address/${address}/utxo`
    const response = await fetch(url)
    return response.json()
  }

  createPsbt = async (publicKeyString, unspentOutputs, recipient) => {
    const bitcoinTestnet = {
      bech32: 'tb',
      pubKeyHash: 0x6f,
      scriptHash: 0xc4,
      wif: 0xef,
    }

    // choose first unspent output
    const output = unspentOutputs[0]

    const publicKey = hex.decode(publicKeyString)
    const tx = new btc.Transaction({
      allowUnknowOutput: true,
    });

    const p2wpkh2 = btc.p2wpkh(publicKey, bitcoinTestnet);
    const p2sh = btc.p2sh(p2wpkh2, bitcoinTestnet);

    const fee = 3000n // set the miner fee amount
    const recipientAmount = BigInt(output.value) - fee

    tx.addInput({
      txid: output.txid,
      index: output.vout,
      witnessUtxo: {
        script: p2sh.script ? p2sh.script : Buffer.alloc(0),
        amount: BigInt(output.value),
      },
      redeemScript: p2sh.redeemScript ? p2sh.redeemScript : Buffer.alloc(0),
      witnessScript: p2sh.witnessScript,
      sighashType: btc.SignatureHash.SINGLE|btc.SignatureHash.ANYONECANPAY
    })

    tx.addOutputAddress(recipient, recipientAmount, bitcoinTestnet)

    tx.addOutput({
      script: btc.Script.encode([
        'HASH160',
        'DUP',
        new TextEncoder().encode('SP1KSN9GZ21F4B3DZD4TQ9JZXKFTZE3WW5GXREQKX')
      ]),
      amount: 0n,
    })

    tx.addOutput({
      script: btc.Script.encode([
        'RETURN',
        new TextEncoder().encode('SP1TA24KDEVPSJPC7K6Q41MF5PBYMGRAYGKQH20CN')
      ]),
      amount: BigInt(4000),
    })
    const psbt = tx.toPSBT(0)
    const psbtB64 = base64.encode(psbt)
    return psbtB64
  }

  onSignTransactionClick = async () => {
    const unspentOutputs = await this.getUnspent(this.state.paymentAddress)

    if (unspentOutputs.length < 1) {
      alert('No unspent outputs found for address')
    }
    // create psbt sending from payment address to ordinals address
    const outputRecipient = this.state.ordinalsAddress;

    const psbtBase64 = await this.createPsbt(
      this.state.paymentPublicKey, 
      unspentOutputs, 
      outputRecipient
    )

    const signPsbtOptions = {
      payload: {
        network: {
          type: "Testnet",
        },
        message: "Sign Transaction",
        psbtBase64: psbtBase64,
        broadcast: false,
        inputsToSign: [
          {
            address: this.state.paymentAddress,
            signingIndexes: [0],
            sigHash: btc.SignatureHash.SINGLE|btc.SignatureHash.ANYONECANPAY,
          },
        ],
      },
      onFinish: (response) => {
        alert(response.psbtBase64);
      },
      onCancel: () => alert("Canceled"),
    };
    await signTransaction(signPsbtOptions);
  };

  onSignMessageClick = async () => {
    const signMessageOptions = {
      payload: {
        network: {
          type: "Testnet",
        },
        address: this.state.ordinalsAddress,
        message: "Sign Transaction",
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    };
    await signMessage(signMessageOptions);
  }


  render() {
    return (
      <div style={{ padding: 30 }}>
        Sats Connect Test App
        <div>
          <br />
          {this.state.paymentAddress && (
            <div>Payment Address: {this.state.paymentAddress}</div>
          )}
          {this.state.ordinalsAddress && (
            <div>Ordinals Address: {this.state.ordinalsAddress}</div>
          )}

          <div style={{ background: "lightgray", padding: 30, margin: 10 }}>
            <button
              style={{ height: 30, width: 180 }}
              onClick={this.onConnectClick}
            >
              Connect
            </button>
          </div>

          <div style={{ background: "lightgray", padding: 30, margin: 10 }}>
            <button
              style={{ height: 30, width: 180 }}
              onClick={this.onSignTransactionClick}
            >
              Sign Transaction
            </button>
          </div>

          <div style={{ background: "lightgray", padding: 30, margin: 10 }}>
            <button
              style={{ height: 30, width: 180 }}
              onClick={this.onSignMessageClick}
            >
              Sign message
            </button>
          </div>
          <br />
        </div>
      </div>
    );
  }
}

export default Dashboard;

