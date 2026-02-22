import fs from "node:fs/promises";
import fssync from "node:fs";
import ora from "ora";

import openai from "../../utils/openai.js";

// Transcribes an audio file to text using the OpenAI Whisper API.
// The transcription is either written to a file (--output) or printed to stdout.
export async function transcribe(audioFile, options) {
  const spinner = ora("Transcribing audio").start();

  // Open the audio file as a readable stream; the API accepts common formats
  // such as mp3, mp4, wav, and webm.
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
