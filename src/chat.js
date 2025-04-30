import fs from "fs";
import chalk from "chalk";
import { Option } from "commander";

import openai from "./utils/openai.js";
import promptUser from "./utils/promptUser.js";
import { personas } from "./config/personas.js";

async function chat(options) {
  const { persona } = options;
  const assistantPrompt = (persona) =>
    chalk.blue("AI ") + chalk.yellow(`(${persona ? persona : "Assistant"}):`);
  let systemPrompt = "You are a helpful assistant designed to answer questions, explain complex topics in way that are easy to understand, and help users think through problems to arrive at the best solution.";

  if (persona) {
    systemPrompt = personas.find(
      (p) => p.name === persona
    ).systemPrompt;
  }

  const messages = [{ role: "system", content: systemPrompt }];

  console.log(assistantPrompt(persona), "How can I help you today?");

  if (options.output) {
    function writeArrayToFile() {
      fs.writeFileSync(options.output, JSON.stringify(messages, null, 2));
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
    const input = await promptUser(chalk.green("You: "));

    if (input[0] === '/') {
      const [command, ...commandArgs] = input.slice(1).split(' ')

      if (command === 'exit') {
        break
      } if (command === 'process') {
        const processingInstructions = await promptUser('Processing instructions: ')
        const file = await promptUser('File name: ')

        if (processingInstructions) {
          const response = await openai.chat.completions.create({
            model: "o4-mini",
            messages: [
              { role: "system", content: "Your job is to process chat logs. A user will provide you instructions on how to process the chat logs. Do Whatever they ask. You're response will be written to a file. It's important that your output is valid syntax for whatever fil you're writing." },
              { role: 'user', content: processingInstructions + '\n\n---\n\n' + JSON.stringify(messages, null, 2) }
            ],
          });

          if (file) {
            fs.writeFileSync(file, response.choices[0].message.content);
          }
        } else {
          console.log("No instructions provided")
        }
      } if (command === 'save') {
        const file = commandArgs[0] || `chat-${Date.now()}.json`

        if (file) {
          fs.writeFileSync(file, JSON.stringify(messages, null, 2));
        }
      } else {
        console.log('Command Not Found')
      }
      continue
    }

    messages.push({ role: "user", content: input });

    const stream = await openai.chat.completions.create({
      model: "o4-mini",
      messages,
      stream: true,
    });

    process.stdout.write(assistantPrompt(persona) + " ");

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
        "-p --persona <persona>",
        "The persona the AI should take"
      ).choices(personas.map((persona) => persona.name))
    )
    .action((options) => {
      chat(options);
    });
}
