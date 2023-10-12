import { useState } from "react";
import type { Capability } from "sats-connect";
import { BitcoinNetworkType, createInscription } from "sats-connect";

type Props = {
  network: BitcoinNetworkType;
  capabilities: Set<Capability>;
};

const CreateBinaryInscription = ({ network, capabilities }: Props) => {
  const [content, setContent] = useState<string>("");
  const [contentType, setContentType] = useState<string>("image/jpeg");

  const onCreateClick = async () => {
    try {
      await createInscription({
        payload: {
          network: {
            type: network,
          },
          contentType,
          content,
          payloadType: "BASE_64",
          /** Optional parameters:
          appFeeAddress, // the address where the inscription fee should go
          appFee: 1000 // the amount of sats that should be sent to the fee address
          */
        },
        onFinish: (response) => {
          alert(response.txId);
        },
        onCancel: () => alert("Canceled"),
      });
    } catch (error) {
      alert(`An error ocurred: ${error.message}`);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setContent("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const contentString = e.target?.result as string;
      if (!contentString) {
        return;
      }

      const base64String = contentString.split(",")[1];
      setContent(base64String);
    };
    reader.readAsDataURL(selectedFile);
  };

  if (!capabilities.has("createInscription")) {
    return (
      <div className="container">
        <h3>Create file inscription</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Create file inscription</h3>
      <p>
        Creates an inscription from a desired file with specified content type.
        The inscription will be sent to your ordinals address.
      </p>
      <p>
        A service fee and service fee address can be added to the inscription
        request as part of the payload if desired.
      </p>
      <div>
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
          {content}
          <br />
          <input type="file" onChange={onFileSelect} />
        </p>
        <button onClick={onCreateClick}>Create inscription</button>
      </div>
    </div>
  );
};

export default CreateBinaryInscription;
