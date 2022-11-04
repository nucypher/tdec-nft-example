import React, { useState } from "react";
import { Mumbai, Goerli, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { Cohort, DeployedStrategy, Strategy } from "@nucypher/nucypher-ts";

interface Props {
  setDeployedStrategy: (strategy: DeployedStrategy) => void;
  setLoading: (loading: boolean) => void;
}

export const StrategyBuilder = ({ setDeployedStrategy, setLoading }: Props) => {
  const { switchNetwork } = useEthers();
  const [shares, setShares] = useState(1);
  const [threshold, setThreshold] = useState(1);

  const makeCohort = async () => {
    const cohortConfig = {
      threshold,
      shares,
      porterUri: "https://porter-lynx.nucypher.community",
    };
    const goodUrsulas = [
      "0xb15d5A4e2be34f4bE154A1b08a94Ab920FfD8A41",
      "0x48C8039c32F4c6f5cb206A5911C8Ae814929C16B",
      "0x210eeAC07542F815ebB6FD6689637D8cA2689392",
    ].slice(0, shares); // TODO: Remove after updating nucypher-ts
    const cohort = await Cohort.create(
      cohortConfig,
      goodUrsulas as unknown[] as never[] // TODO: remove after updating nucypher-ts
    );
    console.log("Created cohort: ", cohort);
    return cohort;
  };

  const deployStrategy = async () => {
    setLoading(true);
    await switchNetwork(Mumbai.chainId);
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const cohort = await makeCohort();
    const strategy = Strategy.create(
      cohort,
      new Date(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    );
    console.log("Created strategy: ", strategy);

    const deployedStrategy = await strategy.deploy("test", web3Provider);
    setDeployedStrategy(deployedStrategy);
    console.log("Deployed Strategy: ", deployedStrategy);

    await switchNetwork(Goerli.chainId);
    setLoading(false);
  };

  return (
    <div>
      <h2>Build Strategy</h2>
      <label htmlFor="thresholds">Select Threshold:</label>
      <input
        id="thresholds"
        type="number"
        defaultValue={1}
        onChange={(e) => setThreshold(parseInt(e.currentTarget.value))}
      />
      <label htmlFor="shares">Select Shares:</label>
      <input
        id="shares"
        type="number"
        defaultValue={1}
        onChange={(e) => setShares(parseInt(e.currentTarget.value))}
      />
      <button onClick={deployStrategy}>Deploy Strategy</button>
    </div>
  );
};
