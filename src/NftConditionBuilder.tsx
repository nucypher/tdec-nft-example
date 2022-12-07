import { ConditionSet, Condition, Conditions } from "@nucypher/nucypher-ts";
import React, { useState } from "react";
import { useEthers } from "@usedapp/core";

interface Props {
  conditions?: ConditionSet;
  setConditions: (value: ConditionSet) => void;
  enabled: boolean;
}

export const NftConditionBuilder = ({
  conditions,
  setConditions,
  enabled
}: Props) => {
  const { library } = useEthers();
  const GOERLI_NFT_ADDRESS =
    "0x932Ca55B9Ef0b3094E8Fa82435b3b4c50d713043"; // https://goerli-nfts.vercel.app/
  const [contractAddress, setContractAddress] = useState(
    GOERLI_NFT_ADDRESS
  );
  const [tokenId, setTokenId] = useState("");
  const [chain, setChain] = useState(5);

  if (!enabled || !library) {
    return <></>;
  }

  const makeInput = (
    onChange = (e: any) => console.log(e),
    defaultValue?: string | number
  ) => (
    <input
      type="string"
      onChange={(e: any) => onChange(e.target.value)}
      defaultValue={defaultValue}
    />
  );

  const makeChainInput = (
    onChange = (e: any) => console.log(e),
    defaultValue?: number
  ) => (
    <input
      type="number"
      onChange={(e: any) => onChange(Number.parseInt(e.target.value))}
      defaultValue={defaultValue}
    />
  );

  const ContractAddressInput = makeInput(
    setContractAddress,
    GOERLI_NFT_ADDRESS
  );
  const TokenIdInput = makeInput(setTokenId);
  const chainInput = makeChainInput(setChain, 5);

  const makeEvmCondition = (): Condition => {
    if (tokenId) {
      return new Conditions.EvmCondition({
        contractAddress,
        chain,
        standardContractType: "ERC721",
        method: "ownerOf",
        parameters: [parseInt(tokenId, 10)],
        returnValueTest: {
          comparator: "==",
          value: ":userAddress"
        }
      });
    }
    return new Conditions.EvmCondition({
      contractAddress,
      chain,
      standardContractType: "ERC721",
      method: "balanceOf",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: ">",
        value: "0"
      }
    });
  };

  const onCreateCondition = (e: any) => {
    e.preventDefault();
    setConditions(new ConditionSet([makeEvmCondition()]));
  };

  const ConditionList =
    conditions && conditions?.conditions.length > 0 ? (
      <div>
        <h3>Condition JSON Preview</h3>
        <pre>
          {conditions?.conditions.map((condition, index) => (
            <div key={index}>
              {JSON.stringify((condition as Condition).toObj(), null, 2)}
            </div>
          ))}
        </pre>
      </div>
    ) : (
      <></>
    );

  return (
    <>
      <h2>Step 1 - Create A Conditioned Access Policy</h2>
      <div>
        <div>
          <h3>Customize your NFT-Condition</h3>
          <div>
            <p>ERC721 Contract Address {ContractAddressInput}</p>
            <p>(Optional) TokenId {TokenIdInput}</p>
            <p>Chain Id {chainInput}</p>
          </div>
          <button onClick={onCreateCondition}>Create Conditions</button>
        </div>
        {ConditionList}
      </div>
    </>
  );
};
