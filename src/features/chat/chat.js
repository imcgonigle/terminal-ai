import fs from "fs";
import chalk from "chalk";

import openai from "../../utils/openai.js";
import promptUser from "../../utils/promptUser.js";
import { personas } from "../../config/personas.js";

// Interactive multi-turn chat. Sends the full message history with every request
// so the model retains context across turns.
export async function chat(options) {
  const { persona } = options;
  // Formats the AI speaker label, e.g. "AI (programmer):".
  const assistantPrompt = (persona) =>
    chalk.blue("AI ") + chalk.yellow(`(${persona ? persona : "Assistant"}):`);
  let systemPrompt = "You are a helpful assistant designed to answer questions, explain complex topics in way that are easy to understand, and help users think through problems to arrive at the best solution.";

  // Use the persona's system prompt if one was chosen; otherwise keep the default.
  if (persona) {
    systemPrompt = personas.find(
      (p) => p.name === persona
    ).systemPrompt;
  }

  // Seed the conversation — the system message is always the first entry.
  const messages = [{ role: "system", content: systemPrompt }];

  console.log(assistantPrompt(persona), "How can I help you today?");

  if (options.output) {
    // Flush the full message history to a JSON file on any exit so no
    // conversation is lost. Covers normal exit, ctrl-c, and uncaught errors.
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

  // Chat loop — runs until the user types /exit.
  while (true) {
    const input = await promptUser(chalk.green("You: "));

    if (input[0] === '/') {
      // Available slash commands: /exit  /process  /save [filename]
      const [command, ...commandArgs] = input.slice(1).split(' ')

      if (command === 'exit') {
        break
      } if (command === 'process') {
        // Send the chat history to the model with custom instructions and write
        // the result to a file (e.g. convert the conversation to markdown docs).
        const processingInstructions = await promptUser('Processing instructions: ')
        const file = await promptUser('File name: ')

        if (processingInstructions) {
          const response = await openai.chat.completions.create({
            model: options.model,
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
        // Save chat history as JSON. Defaults to a timestamped filename.
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

    // Stream the response so tokens print as they arrive.
    const stream = await openai.chat.completions.create({
      model: options.model,
      messages,
      stream: true,
    });

    process.stdout.write(assistantPrompt(persona) + " ");

    let response = "";

    // Accumulate the full response while printing each chunk live.
    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || "";
      response += chunkContent;
      process.stdout.write(chunkContent);
    }

    // Add the completed AI turn to history so the next request has context.
    const aiMessage = { role: "assistant", content: response };
    messages.push(aiMessage);
  }
}
