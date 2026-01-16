import fs from "fs";
import ora from "ora";
import terminalImage from "term-img";
import { toFile } from "openai";

import openai from "../../utils/openai.js";

export async function imagine(prompt, options) {
  const filePath = options.output ? options.output : `./image-${Date.now()}.png`;

  const action = options.file ? 'edit' : 'generate'

  const spinner = ora("Generating images").start();
  const image = await openai.images[action]({
    model: options.model,
    prompt,
    image: options.file ? await toFile(fs.createReadStream(options.file), null, {
      type: "image/png",
    }) : undefined,
    // response_format: "b64_json",
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

