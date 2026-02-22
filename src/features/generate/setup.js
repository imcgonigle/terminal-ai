import { generate } from "./generate.js";

// Registers the `generate` subcommand, which uses the AI to create a complete
// file from a natural-language request. The shared `info` object is forwarded
// so the command can incorporate any text piped into the process via stdin.
export default function addGenerateToProgram(program, info) {
  program
    .command("generate")
    .description("Generate a file based on your request")
    .argument("<request>", "Your request for the contents of the file")
    .option("-o, --output <output>", "Output the response to a file")
    .action((request, options) => {
      generate(request, options, info);
    });
}
