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
  const SQUARE_NFT_RINKEBY_ADDRESS =
    "0x39Ec448b891c476e166b3C3242A90830DB556661";
  const [contractAddress, setContractAddress] = useState(
    SQUARE_NFT_RINKEBY_ADDRESS
  );
  const [tokenId, setTokenId] = useState("");
  const [chain, setChain] = useState("Görli");

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

  const ContractAddressInput = makeInput(
    setContractAddress,
    SQUARE_NFT_RINKEBY_ADDRESS
  );
  const TokenIdInput = makeInput(setTokenId);
  const chainInput = makeInput(setChain, "Görli");

  const makeEvmCondition = (): Condition => {
    // TODO: Capitalizing is required
    const capitalizeFirstLetter = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1);
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
            <p>Chain {chainInput}</p>
          </div>
          <button onClick={onCreateCondition}>Create Conditions</button>
        </div>
        {ConditionList}
      </div>
    </>
  );
};
