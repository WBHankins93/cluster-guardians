"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";

interface CommandSuggestion {
  command: string;
  description: string;
}

const commandSuggestions: CommandSuggestion[] = [
  { command: "kubectl get pods -n forest", description: "List all pods in forest namespace" },
  { command: "kubectl get services -n forest", description: "List all services in forest namespace" },
  { command: "kubectl get namespaces", description: "List all namespaces" },
  { command: "kubectl describe pod <name> -n forest", description: "Get detailed info about a pod" },
  { command: "kubectl describe service <name> -n forest", description: "Get detailed info about a service" },
  { command: "kubectl logs <pod-name> -n forest", description: "View logs from a pod" },
  { command: "kubectl get pods -n default", description: "List pods in default namespace" },
];

interface CommandInputProps {
  onExecute: (command: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function CommandInput({ onExecute, isLoading = false, placeholder }: CommandInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim().length > 0) {
      const filtered = commandSuggestions.filter(
        (s) =>
          s.command.toLowerCase().includes(input.toLowerCase()) ||
          s.description.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (input.trim()) {
        handleExecute();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (suggestion: CommandSuggestion) => {
    setInput(suggestion.command);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleExecute = () => {
    if (input.trim()) {
      onExecute(input.trim());
      setInput("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: CommandSuggestion) => {
    handleSelectSuggestion(suggestion);
  };

  return (
    <div className="relative w-full">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay to allow click on suggestion
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder || "Type kubectl command or select from suggestions..."}
            className="w-full px-3 py-2 bg-gray-800 text-gray-100 font-mono text-sm rounded border border-gray-700 focus:border-k8s-blue focus:outline-none"
            disabled={isLoading}
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="font-mono text-sm text-k8s-blue-light">
                    {suggestion.command}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {suggestion.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button onClick={handleExecute} disabled={!input.trim() || isLoading}>
          Execute
        </Button>
      </div>

      {/* Quick command buttons */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-xs text-gray-400 self-center">Quick commands:</span>
        {commandSuggestions.slice(0, 3).map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setInput(suggestion.command);
              inputRef.current?.focus();
            }}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
            disabled={isLoading}
          >
            {suggestion.command.split(" ").slice(0, 2).join(" ")}...
          </button>
        ))}
      </div>
    </div>
  );
}

