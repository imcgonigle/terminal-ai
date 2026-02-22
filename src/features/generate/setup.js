import { generate } from "./generate.js";

// `generate` — creates a complete file from a natural-language request.
// `info` is passed so the command can include piped stdin as additional context.
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
