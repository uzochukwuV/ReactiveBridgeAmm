import ChainSwitcher from "../ChainSwitcher";
import { useState } from "react";

export default function ChainSwitcherExample() {
  const [fromChain, setFromChain] = useState(64165);
  const [toChain, setToChain] = useState(84532);

  const handleSwitch = () => {
    console.log("Switch chains triggered");
    setFromChain(toChain);
    setToChain(fromChain);
  };

  return (
    <div className="p-4 bg-background">
      <ChainSwitcher fromChain={fromChain} toChain={toChain} onSwitch={handleSwitch} />
    </div>
  );
}
