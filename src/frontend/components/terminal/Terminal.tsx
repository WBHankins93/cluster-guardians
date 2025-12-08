"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  onCommand: (command: string) => Promise<string>;
  welcomeMessage?: string;
  prompt?: string;
}

export function Terminal({ onCommand, welcomeMessage, prompt = "$ " }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const xterm = new XTerm({
      cursorBlink: true,
      theme: {
        background: "#1A1B26",
        foreground: "#A9B1D6",
        cursor: "#7AA2F7",
        black: "#32344A",
        red: "#F7768E",
        green: "#9ECE6A",
        yellow: "#E0AF68",
        blue: "#7AA2F7",
        magenta: "#BB9AF7",
        cyan: "#7DCFFF",
        white: "#C0CAF5",
        brightBlack: "#444B6A",
        brightRed: "#FF7A93",
        brightGreen: "#B9F27C",
        brightYellow: "#FF9E64",
        brightBlue: "#7DA6FF",
        brightMagenta: "#C0B7F9",
        brightCyan: "#B4F9F8",
        brightWhite: "#E0E0E0",
      },
      fontSize: 14,
      fontFamily: "monospace",
      rows: 24,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Welcome message
    if (welcomeMessage) {
      xterm.writeln(welcomeMessage);
      xterm.writeln("");
    }

    xterm.write(prompt);

    // Handle input
    xterm.onData((data) => {
      if (isProcessing) return;

      const char = data;

      // Handle Enter
      if (char === "\r") {
        if (currentLine.trim()) {
          xterm.writeln("");
          handleCommand(currentLine.trim());
          setCurrentLine("");
        } else {
          xterm.writeln("");
          xterm.write(prompt);
        }
        return;
      }

      // Handle Backspace
      if (char === "\x7f") {
        if (currentLine.length > 0) {
          setCurrentLine(currentLine.slice(0, -1));
          xterm.write("\b \b");
        }
        return;
      }

      // Handle Ctrl+C
      if (char === "\x03") {
        xterm.writeln("^C");
        setCurrentLine("");
        xterm.write(prompt);
        return;
      }

      // Regular character
      if (char >= String.fromCharCode(32)) {
        setCurrentLine(currentLine + char);
        xterm.write(char);
      }
    });

    const handleCommand = async (command: string) => {
      setIsProcessing(true);

      try {
        const output = await onCommand(command);
        xtermRef.current?.writeln(output);
      } catch (error) {
        xtermRef.current?.writeln(`\x1b[31mError: ${error}\x1b[0m`);
      } finally {
        setIsProcessing(false);
        xtermRef.current?.write(prompt);
      }
    };

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      xterm.dispose();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      className="terminal-container w-full h-full"
      style={{ height: "400px" }}
    />
  );
}
