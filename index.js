#!/usr/bin/env node
import figlet from "figlet";
import gradient from "gradient-string";

import { Command } from "commander";

import setupSpeak from "./src/speak.js";
import setupAsk from "./src/ask.js";
import setupImagine from "./src/imagine.js";
import setupTranscribe from "./src/transcribe.js";
import setupChat from "./src/chat.js";
import setupExplain from "./src/explain.js";

const program = new Command();

program
  .name("terminal-ai")
  .description("A CLI tool to gererate content using various AI models")
  .version("0.1.0");

const info = {}

setupAsk(program, info);
setupSpeak(program);
setupImagine(program);
setupTranscribe(program);
setupChat(program);
setupExplain(program);

if (process.stdin.isTTY) {
  console.log(
    gradient.retro(figlet.textSync("Terminal AI", { horizontalLayout: "full" }))
  );
  program.parse();
} else {
  info.inputPipedToProgram = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { info.inputPipedToProgram += chunk; });
  process.stdin.on('end', () => {
    program.parse();
  });
}

