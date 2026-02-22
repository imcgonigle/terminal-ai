// Reads a file and asks the AI to summarize its contents.
import fs from "fs";
import ora from "ora";

import openai from "../../utils/openai.js";

// Reads the given file, sends its content to the AI for summarization, and
// streams the response. Output is written to a file when --output is set,
// otherwise printed directly to stdout.
export async function summarize(filePath, options) {
  let prompt;

  const fileContent = fs.readFileSync(filePath, "utf8");

  // Embed the raw file content in the prompt so the model can read it.
  prompt = `Please read this file and summarize the contents:\n\n${fileContent}\n\n`;
  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant who helps summarize the contents of a file. Read the file and explain key details mentioned in the file. Explain what the file is used for, and what it's about.",
      },
      { role: "user", content: prompt },
    ],
    stream: true,
  });

  if (options.output) {
    const spinner = ora("Saving response to file").start();
    const file = fs.createWriteStream(options.output);

    // Write each streamed chunk directly to the output file.
    for await (const chunk of stream) {
      file.write(chunk.choices[0]?.delta?.content || "");
    }

    file.end();

    spinner.succeed(`The response has been saved to ${options.output}`);
    return;
  } else {
    // Print each token to stdout as it arrives for a real-time feel.
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  }
}

