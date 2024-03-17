#!/usr/bin/env node
import "dotenv/config";
import figlet from "figlet";
import gradient from "gradient-string";

import { Command } from "commander";

import setupSpeak from "./src/speak.js";
import setupAsk from "./src/ask.js";
import setupImagine from "./src/imagine.js";
import setupTranscribe from "./src/transcribe.js";
import setupChat from "./src/chat.js";

const program = new Command();

program
  .name("terminal-ai")
  .description("A CLI tool to gererate content using various AI models")
  .version("0.1.0");

setupAsk(program);
setupSpeak(program);
setupImagine(program);
setupTranscribe(program);
setupChat(program);

console.log(
  gradient.retro(figlet.textSync("Terminal AI", { horizontalLayout: "full" }))
);

program.parse();
