import fs from "fs";
import path from "path";
import ora from "ora";
import createPlayer from 'play-sound'

import openai from "../../utils/openai.js";

// Converts text to speech using the OpenAI TTS API, saves the audio as an MP3,
// and immediately plays it through the system's default audio player.
export async function speak(input, options) {
  // Allow reading the input text from a file instead of the CLI argument.
  if (options.file) {
    input = fs.readFileSync(options.file, "utf8");
  }

  const output = options.output;
  // Default to ./speech.mp3 when no output path is provided.
  const speechFile = path.resolve(output ? output : "./speech.mp3");

  const spinner = ora("Saving speech to file").start();

  // Request speech synthesis from the API; the response body contains raw audio.
  const mp3 = await openai.audio.speech.create({
    model: options.model,
    voice: options.voice,
    instructions: options.instructions,
    input: input,
  });

  // Convert the response to a Buffer and write it to disk.
  const buffer = Buffer.from(await mp3.arrayBuffer());

  await fs.promises.writeFile(speechFile, buffer);

  spinner.succeed(`The audio has been saved to ${speechFile}`);

  // Play the saved MP3 file using whatever audio player is available on the OS.
  const player = createPlayer({})

  player.play(speechFile, function (err) {
    if (err) throw err
  })
}

