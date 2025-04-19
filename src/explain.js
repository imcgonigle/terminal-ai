// Take a file and context and ask the AI model a question about it.
import fs from "fs";
import ora from "ora";
import { Option } from "commander";

import openai from "./utils/openai.js";

async function summarize(filePath, options) {
  let prompt;

  const fileContent = fs.readFileSync(filePath, "utf8");

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

    for await (const chunk of stream) {
      file.write(chunk.choices[0]?.delta?.content || "");
    }

    file.end();

    spinner.succeed(`The response has been saved to ${options.output}`);
    return;
  } else {
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  }
}

export default function addAskToProgram(program) {
  program
    .command("summarize")
    .description("Summarize the contents of a file")
    .argument("<filePath>", "The file you want to summarize the contents of")
    .option("-c, --context <context>", "Context to give about this file")
    .option("-o, --output <output>", "Output the response to a file")
    .option("-j, --json", "Output the response in JSON format")
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["gpt-4", "gpt-3.5-turbo"])
        .default("gpt-4")
    )
    .action((filePath, options) => {
      summarize(filePath, options);
    });
}
