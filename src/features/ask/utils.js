import ora from "ora";

import openai from "../../utils/openai.js";

import { personas } from "../../config/personas.js";

// Return the system prompt for the requested persona, or a generic helpful
// assistant prompt if no persona was specified.
export function getSystemPrompt(persona) {
  const systemPrompt = personas.find(
    ({ name }) => name === persona
  )?.systemPrompt || "You are a helpful assistant who helps answers technical questions.";

  return systemPrompt;
}

// Build the user-facing prompt from the CLI question, optional file content,
// and any text piped into the process via stdin.
export function createUserPrompt(question, options, info) {
  let prompt;

  if (options.file) {
    // Prepend the file contents so the model has context before answering.
    const fileContent = fs.readFileSync(options.file, "utf8");
    prompt = `Please read this input file and respond to the following prompt:\n\n${fileContent}\n\nPrompt: ${question}`;
  } else {
    prompt = question;
  }

  if (info.pipedInput) {
    // Append piped stdin content (separated by a horizontal rule) so the model
    // can reference it when answering the question.
    prompt += '\n\n---\n\n' + info.pipedInput;
  }

  return prompt;
}

// Send the prompt to the OpenAI chat completions API with streaming enabled.
// Shows a spinner while waiting for the first response token, then returns the
// stream so the caller can iterate over chunks.
export async function askLLM(prompt, systemPrompt, options) {
  const spinner = ora("Generating response...").start();
  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    response_format: { type: options.json ? "json_object" : "text" },
    stream: true,
  });
  spinner.stop();

  return stream;
}
