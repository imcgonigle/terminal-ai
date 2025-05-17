import fs from "node:fs/promises";
import fssync from "node:fs";
import ora from "ora";

import openai from "../../utils/openai.js";

export async function transcribe(audioFile, options) {
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
