import { Option } from "commander";
import { summarize } from "./summarize.js";

export default function addSummarizeToProgram(program) {
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
