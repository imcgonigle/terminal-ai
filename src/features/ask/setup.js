import { Option } from "commander";
import { ask } from './ask.js'

export default function addAskToProgram(program, info) {
  program
    .command("ask")
    .description("Ask AI a question")
    .argument("<question>", "The questions you want to ask the AI model")
    .option("-o, --output <output>", "Output the response to a file")
    .option("-f, --file <file>", "A file to ask the question about")
    .option("-j, --json", "Output the response in JSON format")
    .option("-p, --persona <persona>", "The persona the AI should take")
    .addOption(
      new Option("-m, --model <model>", "The model to use")
        .choices(["o4-mini", "gpt-4", "gpt-4o", "o3", "o1", "gpt-4.1", "gpt-3.5-turbo"])
        .default("o4-mini")
    )
    .action((question, options) => {
      ask(question, options, info);
    });
}
