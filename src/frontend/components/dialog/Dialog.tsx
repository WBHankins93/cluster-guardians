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
      }, 30); // Typing speed

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
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center p-4 z-50 animate-fade-in">
      <div className="dialog-box w-full max-w-3xl mb-8 animate-slide-up">
        {/* Speaker Name */}
        <div className="mb-3">
          <span className="inline-block bg-k8s-blue px-4 py-1 rounded-t-lg font-semibold text-sm">
            {dialog.speaker || npcName}
          </span>
        </div>

        {/* Dialog Text */}
        <div className="dialog-text min-h-[100px] mb-6">
          <p className="text-lg whitespace-pre-wrap">{displayedText}</p>
          {isTyping && (
            <span className="inline-block w-2 h-5 bg-k8s-blue-light ml-1 animate-pulse" />
          )}
        </div>

        {/* Choices or Continue Button */}
        <div className="space-y-3">
          {dialog.choices && dialog.choices.length > 0 ? (
            // Show choices
            dialog.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice.nextNodeId)}
                className="dialog-choice w-full text-left"
                disabled={isTyping}
              >
                <span className="text-k8s-blue-light mr-2">▸</span>
                {choice.text}
              </button>
            ))
          ) : (
            // Show continue button
            <div className="flex justify-end">
              <Button onClick={handleContinue} variant="primary">
                {isTyping ? "Skip" : dialog.nextNodeId ? "Continue" : "Close"}
              </Button>
            </div>
          )}
        </div>

        {/* Close button */}
        {!isTyping && !dialog.choices && !dialog.nextNodeId && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            Press any key or click Close to continue
          </div>
        )}
      </div>
    </div>
  );
}
