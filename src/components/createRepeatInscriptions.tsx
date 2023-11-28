import { useState } from "react";
import type { Capability, CreateRepeatInscriptionsResponse } from "sats-connect";
import { BitcoinNetworkType, createRepeatInscriptions } from "sats-connect";

type Props = {
  network: BitcoinNetworkType;
  capabilities: Set<Capability>;
};

const CreateRepeatInscriptions = ({ network, capabilities }: Props) => {
  const [suggestedMinerFeeRate, setSuggestedMinerFeeRate] = useState<number>(8);

  const [content, setContent] = useState<string>(
    '{"p":"brc-20","op":"mint","tick":"doge","amt":"4200"}'
  );
  const [contentType, setContentType] = useState<string>("application/json");
  const [repeat, setRepeat] = useState<string>("12");
  const onCreateClick = async () => {
    try {
      await createRepeatInscriptions({
        payload: {
          network: {
            type: network,
          },
          repeat: Number(repeat),
          contentType,
          content,
          payloadType: "PLAIN_TEXT",
          /** Optional parameters:
          appFeeAddress: "", // the address where the inscription fee should go
          appFee: 1000, // the amount of sats that should be sent to the fee address
          */
          suggestedMinerFeeRate,
        },
        onFinish: (response: CreateRepeatInscriptionsResponse) => {
          alert(response.txId);
        },
        onCancel: () => alert("Canceled"),
      });
    } catch (error) {
      alert(`An error ocurred: ${error.message}`);
    }
  };

  if (!capabilities.has("createRepeatInscriptions")) {
    return (
      <div className="container">
        <h3>Create repeat inscriptions</h3>
        <b>The wallet does not support this feature. Please update your wallet</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Create repeat inscriptions</h3>
      <p>
        Creates a repeat inscription with the desired text and content type. The
        inscription will be sent to your ordinals address.
      </p>
      <p>
        A service fee and service fee address can be added to the inscription
        request as part of the payload if desired.
      </p>
      <div>
        <p>
          <b>Repeat</b>
          <br />
          <input
            type="number"
            min={1}
            max={24}
            step={1}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
        </p>
        <p>
          <b>Content type</b>
          <br />
          <input
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />
        </p>
        <p>
          <b>Content</b>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </p>
        <p>
          <b>Fee rate</b>
          <br />
          <input
            value={suggestedMinerFeeRate}
            onChange={(e) => {
              const newFeeRate = Number(e.target.value);
              setSuggestedMinerFeeRate(
                Number.isNaN(newFeeRate) ? 0 : newFeeRate
              );
            }}
          />
        </p>
        <button onClick={onCreateClick}>Create inscription</button>
      </div>
    </div>
  );
};

export default CreateRepeatInscriptions;
