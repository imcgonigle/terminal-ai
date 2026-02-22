import fs from "fs";
import chalk from "chalk";

import openai from "../../utils/openai.js";
import promptUser from "../../utils/promptUser.js";
import { personas } from "../../config/personas.js";

// Runs an interactive, multi-turn chat session with the AI.
// The full conversation history is kept in `messages` and sent with every
// request so the model has context of prior turns.
export async function chat(options) {
  const { persona } = options;
  // Helper that formats the AI speaker label, showing the persona name when set.
  const assistantPrompt = (persona) =>
    chalk.blue("AI ") + chalk.yellow(`(${persona ? persona : "Assistant"}):`);
  let systemPrompt = "You are a helpful assistant designed to answer questions, explain complex topics in way that are easy to understand, and help users think through problems to arrive at the best solution.";

  // Override the default system prompt when a persona is selected.
  if (persona) {
    systemPrompt = personas.find(
      (p) => p.name === persona
    ).systemPrompt;
  }

  // Seed the conversation with the system prompt so the model knows its role.
  const messages = [{ role: "system", content: systemPrompt }];

  console.log(assistantPrompt(persona), "How can I help you today?");

  if (options.output) {
    // When --output is set, write the full message history to a JSON file on
    // exit so the conversation can be replayed or inspected later.
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

  // Main conversation loop: prompt the user, handle slash commands, or forward
  // the message to the AI and stream the response back.
  while (true) {
    const input = await promptUser(chalk.green("You: "));

    if (input[0] === '/') {
      // Slash commands give the user in-session control without leaving the chat.
      const [command, ...commandArgs] = input.slice(1).split(' ')

      if (command === 'exit') {
        break
      } if (command === 'process') {
        // Ask the model to process the current chat log according to custom
        // instructions provided by the user, and write the result to a file.
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
        // Save the current message history to a JSON file.
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

    // Request a streaming completion so tokens are printed as they arrive.
    const stream = await openai.chat.completions.create({
      model: options.model,
      messages,
      stream: true,
    });

    process.stdout.write(assistantPrompt(persona) + " ");

    let response = "";

    // Print each token chunk as it streams in, accumulating the full response.
    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || "";
      response += chunkContent;
      process.stdout.write(chunkContent);
    }

    // Append the completed AI response to the history for the next turn.
    const aiMessage = { role: "assistant", content: response };
    messages.push(aiMessage);
  }
}
