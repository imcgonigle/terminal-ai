import fs from "fs";
import ora from "ora";
import terminalImage from "term-img";
import { toFile } from "openai";

import openai from "../../utils/openai.js";

// Generates a new image or edits an existing one using the OpenAI images API,
// saves the result as a PNG, and attempts to display it inline in the terminal.
export async function imagine(prompt, options) {
  const filePath = options.output ? options.output : `./image-${Date.now()}.png`;

  // When a source image file is provided, use the edit endpoint; otherwise
  // use the generate endpoint.
  const action = options.file ? 'edit' : 'generate'

  const spinner = ora("Generating images").start();
  const image = await openai.images[action]({
    model: options.model,
    prompt,
    // For edits, stream the source image as a multipart upload.
    image: options.file ? await toFile(fs.createReadStream(options.file), null, {
      type: "image/png",
    }) : undefined,
    // response_format: "b64_json",
  });

  spinner.info("Downloading the image");

  // The API returns the image as a base64-encoded string; write it to disk
  // using the "base64" encoding so the file contains raw binary PNG data.
  fs.writeFile(filePath, image.data[0].b64_json, "base64", function (err) {
    if (err) {
      spinner.error("An error occurred while writing the file");
      console.log(err);
    } else {
      spinner.succeed("The images have been generated");

      // Attempt to render the image inline in the terminal (supported in
      // iTerm2 and other compatible terminals); fall back to a plain message.
      console.log(terminalImage(filePath, {
        fallback: () => {
          console.log('Unable to display images in your terminal')
        }
      }))


      if (options.verbose) {
        // Print the revised prompt that DALL-E actually used (may differ from
        // the user's original prompt after safety rewrites).
        console.log(image.data[0].revised_prompt);
      }
    }
  });
}

