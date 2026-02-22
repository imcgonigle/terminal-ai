import fs from "fs";
import ora from "ora";
import terminalImage from "term-img";
import { toFile } from "openai";

import openai from "../../utils/openai.js";

// Generates or edits an image via the OpenAI images API, saves it as a PNG,
// and tries to display it inline in the terminal.
export async function imagine(prompt, options) {
  const filePath = options.output ? options.output : `./image-${Date.now()}.png`;

  // Use the edit endpoint when a source image is provided; otherwise generate.
  const action = options.file ? 'edit' : 'generate'

  const spinner = ora("Generating images").start();
  const image = await openai.images[action]({
    model: options.model,
    prompt,
    // Upload the source image as a multipart stream for edit requests.
    image: options.file ? await toFile(fs.createReadStream(options.file), null, {
      type: "image/png",
    }) : undefined,
    // response_format: "b64_json",
  });

  spinner.info("Downloading the image");

  // The API returns base64-encoded image data — decode it straight to disk.
  fs.writeFile(filePath, image.data[0].b64_json, "base64", function (err) {
    if (err) {
      spinner.error("An error occurred while writing the file");
      console.log(err);
    } else {
      spinner.succeed("The images have been generated");

      // Render inline if the terminal supports it (e.g. iTerm2); otherwise print a fallback message.
      console.log(terminalImage(filePath, {
        fallback: () => {
          console.log('Unable to display images in your terminal')
        }
      }))


      if (options.verbose) {
        // The model may rewrite the prompt for safety — print what it actually used.
        console.log(image.data[0].revised_prompt);
      }
    }
  });
}

