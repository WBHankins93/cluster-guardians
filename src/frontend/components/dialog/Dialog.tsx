"use client";

import { DialogNode } from "@/shared/types/game";
import { Button } from "@/components/ui";
import { useState, useEffect } from "react";

interface DialogProps {
  dialog: DialogNode;
  onChoice: (nextNodeId: string) => void;
  onClose: () => void;
  npcName?: string;
}

export function Dialog({ dialog, onChoice, onClose, npcName = "NPC" }: DialogProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < dialog.text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + dialog.text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 25); // Typing speed

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, dialog.text]);

  // Reset when dialog changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsTyping(true);
  }, [dialog.id]);

  const handleChoice = (nextNodeId: string) => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(dialog.text);
      setIsTyping(false);
      setCurrentIndex(dialog.text.length);
    } else {
      onChoice(nextNodeId);
    }
  };

  const handleContinue = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(dialog.text);
      setIsTyping(false);
      setCurrentIndex(dialog.text.length);
    } else if (dialog.nextNodeId) {
      onChoice(dialog.nextNodeId);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 dialog-overlay flex items-end justify-center p-4 z-50 animate-fade-in">
      <div className="dialog-box w-full max-w-3xl mb-8 animate-slide-up">
        {/* Terminal Header */}
        <div className="terminal-header -mx-6 -mt-6 mb-4 rounded-t-lg">
          <div className="terminal-header-dot red" />
          <div className="terminal-header-dot yellow" />
          <div className="terminal-header-dot green" />
          <span className="ml-3 text-sm text-terminal-gray font-mono">
            transmission_from_{(dialog.speaker || npcName).toLowerCase().replace(/\s+/g, '_')}.log
          </span>
        </div>

        {/* Speaker Name */}
        <div className="mb-3">
          <span className="inline-block bg-terminal-cyan/20 border border-terminal-cyan/50 px-4 py-1 rounded font-mono font-semibold text-sm text-terminal-cyan">
            [{dialog.speaker || npcName}]
          </span>
        </div>

        {/* Dialog Text */}
        <div className="dialog-text min-h-[100px] mb-6 font-mono">
          <p className="text-lg whitespace-pre-wrap text-terminal-white/90 leading-relaxed">
            {displayedText}
          </p>
          {isTyping && (
            <span className="inline-block w-2 h-5 bg-terminal-green ml-1 animate-pulse" />
          )}
        </div>

        {/* Choices or Continue Button */}
        <div className="space-y-2">
          {dialog.choices && dialog.choices.length > 0 ? (
            // Show choices
            dialog.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice.nextNodeId)}
                className="dialog-choice w-full text-left font-mono"
                disabled={isTyping}
              >
                <span className="text-terminal-cyan mr-2">&gt;</span>
                {choice.text}
              </button>
            ))
          ) : (
            // Show continue button
            <div className="flex justify-end">
              <Button onClick={handleContinue} variant="primary">
                {isTyping ? "[SKIP]" : dialog.nextNodeId ? "[CONTINUE]" : "[CLOSE]"}
              </Button>
            </div>
          )}
        </div>

        {/* Hint text */}
        {!isTyping && !dialog.choices && !dialog.nextNodeId && (
          <div className="mt-4 text-center text-terminal-gray text-sm font-mono">
            &gt; Click to continue_
          </div>
        )}
      </div>
    </div>
  );
}
