import { Option } from "commander";

import { personas } from "../../config/personas.js";

import { chat } from "./chat.js";


export default function addChatToProgram(program) {
  program
    .command("chat")
    .description("Chat with an AI")
    .option("-o, --output <output>", "Output the chat to a file in JSON format")
    .addOption(
      new Option(
        "-p --persona <persona>",
        "The persona the AI should take"
      ).choices(personas.map((persona) => persona.name))
    )
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["o4-mini", "gpt-4", "gpt-4o", "o3", "o1", "gpt-4.1"])
        .default("o4-mini")
    )
    .action((options) => {
      chat(options);
    });
}
