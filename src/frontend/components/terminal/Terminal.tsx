"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const currentLineRef = useRef("");
  const isProcessingRef = useRef(false);

  const handleCommand = useCallback(async (command: string) => {
    if (!xtermRef.current) return;

    isProcessingRef.current = true;

    try {
      const output = await onCommand(command);
      xtermRef.current.writeln(output);
    } catch (error) {
      xtermRef.current.writeln(`\x1b[31m[ERROR] ${error}\x1b[0m`);
    } finally {
      isProcessingRef.current = false;
      xtermRef.current.write("\x1b[32m" + prompt + "\x1b[0m");
    }
  }, [onCommand, prompt]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm with cyber/hacker theme
    const xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      theme: {
        background: "#0a0e14",
        foreground: "#00ff41",
        cursor: "#00ff41",
        cursorAccent: "#0a0e14",
        selectionBackground: "#00ff4140",
        selectionForeground: "#00ff41",
        black: "#0a0e14",
        red: "#ff3333",
        green: "#00ff41",
        yellow: "#f59e0b",
        blue: "#00d4ff",
        magenta: "#a855f7",
        cyan: "#00d4ff",
        white: "#e5e5e5",
        brightBlack: "#1f2937",
        brightRed: "#ff6666",
        brightGreen: "#39ff14",
        brightYellow: "#ffbf00",
        brightBlue: "#00e5ff",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontWeight: "400",
      letterSpacing: 0,
      lineHeight: 1.2,
      rows: 20,
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Write welcome message with cyber styling
    if (welcomeMessage) {
      xterm.writeln("\x1b[36m" + "═".repeat(50) + "\x1b[0m");
      xterm.writeln("\x1b[32m" + welcomeMessage + "\x1b[0m");
      xterm.writeln("\x1b[36m" + "═".repeat(50) + "\x1b[0m");
      xterm.writeln("");
    } else {
      xterm.writeln("\x1b[36m┌─────────────────────────────────────────────────┐\x1b[0m");
      xterm.writeln("\x1b[36m│\x1b[0m  \x1b[32m[CLUSTER GUARDIANS]\x1b[0m Terminal Interface v1.0   \x1b[36m│\x1b[0m");
      xterm.writeln("\x1b[36m│\x1b[0m  \x1b[90mType 'help' for available commands\x1b[0m            \x1b[36m│\x1b[0m");
      xterm.writeln("\x1b[36m└─────────────────────────────────────────────────┘\x1b[0m");
      xterm.writeln("");
    }

    xterm.write("\x1b[32m" + prompt + "\x1b[0m");

    // Handle input
    xterm.onData((data) => {
      if (isProcessingRef.current) return;

      const char = data;

      // Handle Enter
      if (char === "\r") {
        const command = currentLineRef.current.trim();
        xterm.writeln("");
        if (command) {
          handleCommand(command);
        } else {
          xterm.write("\x1b[32m" + prompt + "\x1b[0m");
        }
        currentLineRef.current = "";
        return;
      }

      // Handle Backspace
      if (char === "\x7f") {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          xterm.write("\b \b");
        }
        return;
      }

      // Handle Ctrl+C
      if (char === "\x03") {
        xterm.writeln("\x1b[33m^C\x1b[0m");
        currentLineRef.current = "";
        xterm.write("\x1b[32m" + prompt + "\x1b[0m");
        return;
      }

      // Handle Ctrl+L (clear screen)
      if (char === "\x0c") {
        xterm.clear();
        xterm.write("\x1b[32m" + prompt + "\x1b[0m");
        xterm.write(currentLineRef.current);
        return;
      }

      // Regular character
      if (char >= String.fromCharCode(32)) {
        currentLineRef.current += char;
        xterm.write(char);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      xterm.dispose();
    };
  }, [handleCommand, welcomeMessage, prompt]);

  return (
    <div className="terminal-panel rounded-lg overflow-hidden">
      {/* Terminal header */}
      <div className="terminal-header">
        <div className="terminal-header-dot red" />
        <div className="terminal-header-dot yellow" />
        <div className="terminal-header-dot green" />
        <span className="ml-3 text-sm text-terminal-gray font-mono">kubectl_shell.sh</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-terminal-green font-mono animate-pulse">●</span>
          <span className="text-xs text-terminal-gray font-mono">CONNECTED</span>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="w-full bg-terminal-bg"
        style={{ height: "400px", padding: "8px" }}
      />
    </div>
  );
}
