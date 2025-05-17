import fs from "fs";
import path from "path";
import ora from "ora";
import createPlayer from 'play-sound'

import openai from "../../utils/openai.js";

export async function speak(input, options) {
  if (options.file) {
    input = fs.readFileSync(options.file, "utf8");
  }

  const output = options.output;
  const speechFile = path.resolve(output ? output : "./speech.mp3");

  const spinner = ora("Saving speech to file").start();

  const mp3 = await openai.audio.speech.create({
    model: options.model,
    voice: options.voice,
    instructions: options.instructions,
    input: input,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  await fs.promises.writeFile(speechFile, buffer);

  spinner.succeed(`The audio has been saved to ${speechFile}`);

  const player = createPlayer({})

  player.play(speechFile, function (err) {
    if (err) throw err
  })
}

