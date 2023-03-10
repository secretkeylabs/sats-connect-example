import React from "react";
import { 
  getAddress, 
  signTransaction
} from 'sats-connect';

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

  componentDidMount() {

  }

  onConnectClick = async () => {

    const getAddressOptions = {
      payload: {
        purposes: ['ordinals', 'payment'],
        message: 'Address for receiving Ordinals',
        network: {
          type:'Testnet'
      },
      },
      onFinish: (response) => {
        console.log(response)
        // alert(response.addresses[1].publicKey)
        this.setState({

        })
      },
      onCancel: () => alert('Request canceled'),
    }
    
    await getAddress(getAddressOptions);
  };

  onSignTransactionClick = async () => {
    const signPsbtOptions = {
      payload: {
        network: {
          type:'Testnet'
      },
      message: 'Sign Transaction',
      psbtBase64: `cHNidP8BAKcCAAAAAtJVbmYvrS64adekw4rhCtbWQNNs9IhWFyNrhYIdkG5dAAAAAAD/////hNCzRVacJR32LJ/chDNUO9B0C3/ci9ZJzHIClfjHLSAAAAAAAP////8CoIYBAAAAAAAiUSCjXEwEb409zg9tZ4NJlmnPqVZaF2TYm9Q1txG7GQ/Q3dB+AQAAAAAAF6kUBE+9kGn9tJlLagtxL54ozfiuyqGHAAAAAAABASughgEAAAAAACJRIDmZV7+7TrMlgI87KFqU2MFVtCS9fmg3f4ZF8zwLgUEtARcguZB1Id24Xg5qN2IrfGhe+9yK5TozSSitvRLPIErU5xcAAQEgoIYBAAAAAAAXqRS9FdmY/QjP0cXH1/+o/144F2orn4ciAgN1Cual4w1uAxLWT+SalvUzyZpqp5eYW7Hlychubra2iEcwRAIgOHUp0YFRZXOrpz5V90PLaPDF/uhCPKLTLbEwVtA7wjsCICPkH0tjb3bS+jmqv/6R746ASxFWGcB8/N41rSHO+4cVAQEEFgAUGAo7GWfcpwS2XI7SsZEN06q8yTIAAAA=`,
      broadcast: true,
      inputsToSign: [{
          address: "tb1p8xv400amf6ejtqy08v5949xcc92mgf9a0e5rwluxghenczupgyksrsee6s",
          signingIndexes: [0],
      }],
      },
      onFinish: (response) => {
        console.log(response)
        alert(response.psbtBase64)
      },
      onCancel: () => alert('Canceled'),
    }
    await signTransaction(signPsbtOptions);
  }

  render() {
    return (
      <div style={{ padding: 30 }}>
        Sats Connect Test App
          <div>
            <br />
            {this.state.paymentAddress && <div>Payment Address: {this.state.paymentAddress}</div>}
            {this.state.ordinalsAddress && <div>Ordinals Address: {this.state.ordinalsAddress}</div>}

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
            <br />
          </div>

      </div>
    );
  }
}

export default Dashboard;
