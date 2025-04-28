import fs from "fs";
import ora from "ora";
import terminalImage from "term-img";

import openai from "./utils/openai.js";

async function imagine(prompt, options) {
  const filePath = options.output ? options.output : "./image.png";

  if (options.file) {
    const fileContent = fs.readFileSync(options.file, "utf8");
    prompt = `Please read this input file as context and generate an image for the following prompt:\n\n${fileContent}\n\nPrompt: ${prompt}`;
  }

  const spinner = ora("Generating images").start();
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    quality: options.hd ? "hd" : "standard",
    response_format: "b64_json",
  });

  spinner.info("Downloading the image");

  fs.writeFile(filePath, image.data[0].b64_json, "base64", function (err) {
    if (err) {
      spinner.error("An error occurred while writing the file");
      console.log(err);
    } else {
      spinner.succeed("The images have been generated");

      console.log(terminalImage(filePath, {
        fallback: () => {
          console.log('Unable to display images in your terminal')
        }
      }))


      if (options.verbose) {
        console.log(image.data[0].revised_prompt);
      }
    }
  });
}

export default function addImagineToProgram(program) {
  program
    .command("imagine")
    .description("Generate images from text")
    .argument("<prompt>", "The prompt to generate images from")
    .option("-o, --output <output>", "The file to save the image to")
    .option("-f, --file <file>", "The file to prompt the AI about")
    .option("-v, --verbose", "Verbose output")
    .option("--hd", "Use the HD model")
    .action((prompt, options) => {
      imagine(prompt, options);
    });
}
