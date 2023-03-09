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
          type:'Mainnet'
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
          type:'Mainnet'
      },
      message: 'Sign Transaction',
      psbtBase64: `cHNidP8BAJwCAAAAAnrO9Uh20GiiH10R4MEJUyh9VsP5tmbkN+XUTc1/bWDWAAAAAAD/////es71SHbQaKIfXRHgwQlTKH1Ww/m2ZuQ35dRNzX9tYNYCAAAAAP////8CoA8AAAAAAAAXqRQZVivIA7xaAOUjsj0COkd9CsahbIfECQAAAAAAABepFOTzXZjC8nLWbcHyPPASdngfFlfrhwAAAAAAAQEriBMAAAAAAAAiUSCFOvHlfzDk35H0m5zN8Pm2iyPu5CHv9995x/YNaG8NRgEDBIMAAAABE0Gk4frF1l0HT5kROCxRGq3ZK4fxekuIrmOnRF2xj3IQASIyOv7Y5xCaCCd3Jnwngki65vLsMnIjWCXydTmGSxW6gwEXIDSQSMK3toLA6AfPJLMerIuHaAJHnkKTMeqDLpcfvwtkAAEBIMQJAAAAAAAAF6kUE1jqEog/yiSINDzTHIwsjZpOc8+HAQQWABRntq1IPPR35VuwbUdVR+TURFO0cwAAAA==`,
      broadcast: false,
      inputsToSign: [{
          address: "37qg72pj86wvAEYh8TK42g7ZyHu5eytdRH",
          signingIndexes: [1],
      }],
      },
      onFinish: (response) => {
        console.log(response.psbtBase64)
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
