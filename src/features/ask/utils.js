import ora from "ora";

import openai from "../../utils/openai.js";

import { personas } from "../../config/personas.js";

export function getSystemPrompt(persona) {
  const systemPrompt = personas.find(
    ({ name }) => name === persona
  )?.systemPrompt || "You are a helpful assistant who helps answers technical questions.";

  return systemPrompt;
}

export function createUserPrompt(question, options, info) {
  let prompt;

  if (options.file) {
    const fileContent = fs.readFileSync(options.file, "utf8");
    prompt = `Please read this input file and respond to the following prompt:\n\n${fileContent}\n\nPrompt: ${question}`;
  } else {
    prompt = question;
  }

  if (info.pipedInput) {
    prompt += '\n\n---\n\n' + info.pipedInput;
  }

  return prompt;
}

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
