#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import figlet from "figlet";
import { Command, Option } from "commander";
import ora from "ora";

async function speak(input, options) {
  if (options.file) {
    input = fs.readFileSync(options.file, "utf8");
  }
  const output = options.output;
  const speechFile = path.resolve(output ? output : "./speech.mp3");
  const spinner = ora("Saving speech to file").start();
  const mp3 = await openai.audio.speech.create({
    model: options.hd ? "tts-1-hd" : "tts-1",
    voice: options.voice,
    input: input,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  spinner.stop();
  console.log(speechFile);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

async function askGPT(question, options) {
  let prompt;

  if (options.file) {
    const fileContent = fs.readFileSync(options.file, "utf8");
    prompt = `Please read this input file and respond to the following prompt:\n\n${fileContent}\n\nPrompt: ${question}`;
  } else {
    prompt = question;
  }

  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: [{ role: "user", content: prompt }],
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
    spinner.stop();
    console.log(`The response has been saved to ${options.output}`);
    return;
  } else {
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  }
}

const program = new Command();

program
  .name("terminal-ai")
  .description("A CLI tool to gererate content using various AI models")
  .version("0.1.0");

program
  .command("ask")
  .description("Ask OpenAI's GPT-4 a question")
  .argument("<question>", "The questions you want to ask the AI model")
  .option("-o, --output <output>", "Output the response to a file")
  .option("-f, --file <file>", "A file to ask the question about")
  .option("-j, --json", "Output the response in JSON format")
  .addOption(
    new Option("-m, --model <model>", "The model to use")
      .choices(["gpt-4", "gpt-3.5-turbo"])
      .default("gpt-4")
  )
  .action((question, options) => {
    askGPT(question, options);
  });

program
  .command("speak")
  .description("Generate speech from text")
  .argument("<text>", "The text you want to convert to speech")
  .option("-o, --output <output>", "The file to save the speech to")
  .option("-f, --file <file>", "The file to read the text from")
  .option("-h, --hd", "Use the HD voice model")
  .addOption(
    new Option("-v, --voice <voice>", "The voice to use")
      .choices(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
      .default("alloy")
  )
  .action((text, options) => {
    speak(text, options);
  });

console.log(figlet.textSync("Terminal AI", { horizontalLayout: "full" }));

program.parse();
