import { Option } from "commander";
import { speak } from "./speak.js";

export default function addSpeakToProgram(program) {
  program
    .command("speak")
    .description("Generate speech from text")
    .argument("<text>", "The text you want to convert to speech")
    .option("-o, --output <output>", "The file to save the speech to")
    .option("-f, --file <file>", "The file to read the text from")
    .option("-i, --instructions <instructions>", "Instructions about tone and accent for the model to follow")
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["gpt-4o-mini-tts", "tts-1-hd", "tts-1"])
        .default("gpt-4o-mini-tts")
    )
    .addOption(
      new Option("-v, --voice <voice>", "The voice to use")
        .choices(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
        .default("alloy")
    )
    .action((text, options) => {
      speak(text, options);
    });
}
