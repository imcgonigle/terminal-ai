import { Option } from "commander";

import { imagine } from "./imagine.js";

export default function addImagineToProgram(program) {
  program
    .command("imagine")
    .description("Generate images from text")
    .argument("<prompt>", "The prompt to generate images from")
    .option("-o, --output <output>", "The file to save the image to")
    .option("-f, --file <file>", "The file path of an image to edit or reference")
    .option("-v, --verbose", "Verbose output")
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["gpt-image-1", "dall-e-3", "dall-e-2"])
        .default("gpt-image-1")
    )
    .action((prompt, options) => {
      imagine(prompt, options);
    });
}
