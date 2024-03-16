import fs from "fs";
import readline from "readline";
import chalk from "chalk";
import { Option } from "commander";

import openai from "./utils/openai.js";
import { experts } from "./config/experts.js";

async function chat(options) {
  let systemPrompt = "You are a helpful assistant.";

  if (options.expert) {
    systemPrompt = experts.find(
      (expert) => expert.name === options.expert
    ).systemPrompt;
  }

  const messages = [{ role: "system", content: systemPrompt }];

  console.log(chalk.blue("Assistant:"), "How can I help you today?");

  if (options.output) {
    function writeArrayToFile() {
      fs.writeFileSync(options.output, JSON.stringify(messages));
      process.exit(); // It's important to exit the process manually, as writing to file is a sync operation
    }

    // This will handle normal exit
    process.on("exit", writeArrayToFile);

    // This will handle ctrl+c exit
    process.on("SIGINT", writeArrayToFile);

    // This will handle uncaught exceptions
    process.on("uncaughtException", writeArrayToFile);
  }

  while (true) {
    const input = await new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(chalk.green("You: "), (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    messages.push({ role: "user", content: input });

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      stream: true,
    });

    process.stdout.write(chalk.blue("Assistant: "));

    let response = "";

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || "";
      response += chunkContent;
      process.stdout.write(chunkContent);
    }

    const aiMessage = { role: "assistant", content: response };
    messages.push(aiMessage);
  }
}

export default function addChatToProgram(program) {
  program
    .command("chat")
    .description("Chat with OpenAI's GPT-4")
    .option("-m, --model <model>", "The model to use")
    .option("-o, --output <output>", "Output the chat to a file in JSON format")
    .addOption(
      new Option(
        "-e --expert <expert>",
        "The expert role the AI should take"
      ).choices(experts.map((expert) => expert.name))
    )
    .action((options) => {
      chat(options);
    });
}
