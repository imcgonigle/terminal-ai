import fs from "node:fs/promises";
import fssync from "node:fs";
import ora from "ora";

import openai from "./utils/openai.js";

async function transcribe(audioFile, options) {
  const spinner = ora("Transcribing audio").start();

  const transcription = await openai.audio.transcriptions.create({
    file: fssync.createReadStream(audioFile),
    model: "whisper-1",
  });

  spinner.succeed("The audio has been transcribed");

  if (options.output) {
    const writefileSpinner = ora("Saving transcription to file").start();
    await fs.writeFile(options.output, transcription.text);
    writefileSpinner.succeed(
      `The transcription has been saved to ${options.output}`
    );
  } else {
    console.log(transcription.text);
  }
}

export default function addTranscribeToProgram(program) {
  program
    .command("transcribe")
    .description("Transcribe an audio file")
    .argument("<audioFile>", "The audio file to transcribe")
    .option("-o, --output <output>", "The file to save the transcription to")
    .action((audioFile, options) => {
      transcribe(audioFile, options);
    });
}
