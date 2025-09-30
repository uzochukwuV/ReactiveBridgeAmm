import TokenSelector from "../TokenSelector";
import { useState } from "react";
import { Token } from "@/lib/tokenConfig";

export default function TokenSelectorExample() {
  const [selectedToken, setSelectedToken] = useState<Token | undefined>();

  return (
    <div className="p-4 bg-background max-w-md">
      <TokenSelector
        chainId={64165}
        selectedToken={selectedToken}
        onSelect={(token) => {
          console.log("Token selected:", token);
          setSelectedToken(token);
        }}
        label="SELECT TOKEN"
      />
    </div>
  );
}
