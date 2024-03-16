import fs from "fs";
import path from "path";
import ora from "ora";
import { Option } from "commander";

import openai from "./utils/openai.js";

async function speak(input, options) {
  if (options.file) {
    input = fs.readFileSync(options.file, "utf8");
  }

  const output = options.output;
  const speechFile = path.resolve(output ? output : "./speech.mp3");

  const spinner = ora("Saving speech to file").start();

  const mp3 = await openai.audio.speech.create({
    model: options.hd ? "tts-1-hd" : "tts-1",
    voice: options.voice,
    input: input,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  await fs.promises.writeFile(speechFile, buffer);

  spinner.succeed(`The audio has been saved to ${speechFile}`);
}

export default function addSpeakToProgram(program) {
  program
    .command("speak")
    .description("Generate speech from text")
    .argument("<text>", "The text you want to convert to speech")
    .option("-o, --output <output>", "The file to save the speech to")
    .option("-f, --file <file>", "The file to read the text from")
    .option("-h, --hd", "Use the HD voice model")
    .addOption(
      new Option("-v, --voice <voice>", "The voice to use")
        .choices(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
        .default("alloy")
    )
    .action((text, options) => {
      speak(text, options);
    });
}
