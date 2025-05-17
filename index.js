#!/usr/bin/env node
import figlet from "figlet";
import gradient from "gradient-string";

import { Command } from "commander";

import setupSpeak from "./src/features/speak/setup.js";
import setupAsk from "./src/features/ask/setup.js";
import setupImagine from "./src/features/imagine/setup.js";
import setupTranscribe from "./src/features/transcribe/setup.js";
import setupChat from "./src/features/chat/setup.js";
import setupSummarize from "./src/features/summarize/setup.js";
import setupGenerate from './src/features/generate/setup.js'

const program = new Command();

program
  .name("ai")
  .description("A CLI tool that makes it easy to use the latest AI models")
  .version("0.1.0");

const info = {}

setupAsk(program, info);
setupSpeak(program);
setupImagine(program);
setupTranscribe(program);
setupChat(program);
setupSummarize(program);
setupGenerate(program, info)

if (process.stdin.isTTY) {
  console.log(
    gradient.retro(figlet.textSync("Terminal AI", { horizontalLayout: "full" }))
  );
  program.parse();
} else {
  info.pipedInput = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { info.pipedInput += chunk; });
  process.stdin.on('end', () => {
    program.parse();
  });
}

