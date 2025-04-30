import fs from "fs";
import ora from "ora";
import { Option } from "commander";

import openai from "./utils/openai.js";

import { personas } from "./config/personas.js";

async function askGPT(question, options, info) {
  let prompt;

  let systemPrompt =
    "You are a helpful assistant who helps answers technical questions.";

  if (options.persona) {
    systemPrompt = personas.find(
      (persona) => persona.name === options.persona
    ).systemPrompt;
  }

  if (options.file) {
    const fileContent = fs.readFileSync(options.file, "utf8");
    prompt = `Please read this input file and respond to the following prompt:\n\n${fileContent}\n\nPrompt: ${question}`;
  } else {
    prompt = question;
  }

  if (info.inputPipedToProgram) {
    prompt += '\n\n---\n\n' + info.inputPipedToProgram
  }

  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    response_format: { type: options.json ? "json_object" : "text" },
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

export default function addAskToProgram(program, info) {
  program
    .command("ask")
    .description("Ask OpenAI's GPT-4 a question")
    .argument("<question>", "The questions you want to ask the AI model")
    .option("-o, --output <output>", "Output the response to a file")
    .option("-f, --file <file>", "A file to ask the question about")
    .option("-j, --json", "Output the response in JSON format")
    .option("-p --persona <persona>", "The persona the AI should take")
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["o4-mini", "gpt-4", "gpt-4o", "o3", "o1", "gpt-4.1", "gpt-3.5-turbo"])
        .default("o4-mini")
    )
    .action((question, options) => {
      askGPT(question, options, info);
    });
}
