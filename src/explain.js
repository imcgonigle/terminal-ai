// Take a file and context and ask the AI model a question about it.
import fs from "fs";
import ora from "ora";
import { Option } from "commander";

import openai from "./utils/openai.js";

async function explain(filePath, question, options) {
  let prompt;

  const fileContent = fs.readFileSync(filePath, "utf8");

  prompt = `Please read this input file and respond to the following prompt:\n\n${fileContent}\n\nPrompt: ${question}`;

  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant who helps explain questions related to the contents of a file. You will start by giving a short explaination of the file and then answer any questions the user has.",
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
    .command("explain")
    .description(
      "Ask the model to explain a file's contents and answer questions about it."
    )
    .argument("<filePath>", "The file you want to ask the AI model about")
    .argument("<question>", "The questions you want to ask the AI model")
    .option("-o, --output <output>", "Output the response to a file")
    .option("-j, --json", "Output the response in JSON format")
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["gpt-4", "gpt-3.5-turbo"])
        .default("gpt-4")
    )
    .action((filePath, question, options) => {
      explain(filePath, question, options);
    });
}
