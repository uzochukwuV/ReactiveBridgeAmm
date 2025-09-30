import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { getTokensByChainId, Token } from "@/lib/tokenConfig";

interface TokenSelectorProps {
  chainId: number;
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  label?: string;
}

export default function TokenSelector({
  chainId,
  selectedToken,
  onSelect,
  label = "SELECT TOKEN",
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const tokens = getTokensByChainId(chainId);

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            data-testid="button-token-selector"
          >
            {selectedToken ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedToken.logo}</span>
                <span className="font-medium">{selectedToken.symbol}</span>
                <span className="text-muted-foreground text-sm">
                  {selectedToken.name}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select token...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search token..." />
            <CommandList>
              <CommandEmpty>No token found.</CommandEmpty>
              <CommandGroup>
                {tokens.map((token) => (
                  <CommandItem
                    key={token.address}
                    value={token.symbol}
                    onSelect={() => {
                      onSelect(token);
                      setOpen(false);
                    }}
                    data-testid={`token-item-${token.symbol}`}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedToken?.address === token.address
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span className="text-lg mr-2">{token.logo}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {token.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
