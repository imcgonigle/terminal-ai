import ora from "ora";

import openai from "../../utils/openai.js";

import { personas } from "../../config/personas.js";

// Returns the system prompt for the given persona.
// Falls back to a generic assistant prompt when no persona is selected.
export function getSystemPrompt(persona) {
  const systemPrompt = personas.find(
    ({ name }) => name === persona
  )?.systemPrompt || "You are a helpful assistant who helps answers technical questions.";

  return systemPrompt;
}

// Builds the full user prompt from the question, an optional file, and piped stdin.
export function createUserPrompt(question, options, info) {
  let prompt;

  if (options.file) {
    // Lead with the file contents so the model has context before the question.
    const fileContent = fs.readFileSync(options.file, "utf8");
    prompt = `Please read this input file and respond to the following prompt:\n\n${fileContent}\n\nPrompt: ${question}`;
  } else {
    prompt = question;
  }

  if (info.pipedInput) {
    // Append piped stdin after a divider so the model can distinguish it from the question.
    prompt += '\n\n---\n\n' + info.pipedInput;
  }

  return prompt;
}

// Calls the chat completions API with streaming enabled and returns the stream.
// Shows a spinner until the first token arrives, then stops it so output can flow.
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
