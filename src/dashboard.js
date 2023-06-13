import React from "react";
import { getAddress, signTransaction, signMessage  } from "sats-connect";

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
        });
      },
      onCancel: () => alert("Request canceled"),
    };
    await getAddress(getAddressOptions);
  };

  onSignTransactionClick = async () => {
    const signPsbtOptions = {
      payload: {
        network: {
          type: "Testnet",
        },
        message: "Sign Transaction",
        psbtBase64: `cHNidP8BAP0iAQIAAAAFJpIWdnBrISLL3x0C9zTfHD4QD/iiSIZZDOddiOw3nfMBAAAAAP////8MOrAbm5eUufXOOXaynWnHlhC/zCm/vk8WvaJhQr/F9QAAAAAA/////97rrvjPb2BwWWIKyjbMprjqFD9NgiiUXYoQ/GWpjC9OAAAAAAD/////dZ5pwfzQv7/a7gpXAnMk0+xLYSxOdcAMNNe3BdJvMVgAAAAAAP////+qn+wx2SLcq2Pvt2oq6npPTjC1gnqmvW+a65mPlrtsBgAAAAAA/////wJADQMAAAAAACJRIBO7o4I8bJ6fIoZbe2RnDE1o1kIc1oZPEj1alO8zkFPYgDgBAAAAAAAXqRTKBbOmXl3+EzobfiEpnLQHh2kFW4cAAAAAAAEBK+CTBAAAAAAAIlEgOZlXv7tOsyWAjzsoWpTYwVW0JL1+aDd/hkXzPAuBQS0BAwSDAAAAARcguZB1Id24Xg5qN2IrfGhe+9yK5TozSSitvRLPIErU5xcAAQEr4JMEAAAAAAAiUSA5mVe/u06zJYCPOyhalNjBVbQkvX5oN3+GRfM8C4FBLQEDBIMAAAABFyC5kHUh3bheDmo3Yit8aF773IrlOjNJKK29Es8gStTnFwABASvgkwQAAAAAACJRIDmZV7+7TrMlgI87KFqU2MFVtCS9fmg3f4ZF8zwLgUEtAQMEgwAAAAEXILmQdSHduF4OajdiK3xoXvvciuU6M0korb0SzyBK1OcXAAEBK+CTBAAAAAAAIlEgOZlXv7tOsyWAjzsoWpTYwVW0JL1+aDd/hkXzPAuBQS0BAwSDAAAAARcguZB1Id24Xg5qN2IrfGhe+9yK5TozSSitvRLPIErU5xcAAQEr4JMEAAAAAAAiUSA5mVe/u06zJYCPOyhalNjBVbQkvX5oN3+GRfM8C4FBLQEDBIMAAAABFyC5kHUh3bheDmo3Yit8aF773IrlOjNJKK29Es8gStTnFwAAAA==`,
        broadcast: false,
        inputsToSign: [
          {
            address: this.state.ordinalsAddress,
            signingIndexes: [0],
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
          type: "Mainnet",
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
