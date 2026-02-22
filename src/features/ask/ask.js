import fs from "fs";
import ora from "ora";
import pkg from '@prisma/client'
const { PrismaClient } = pkg

import { askLLM, getSystemPrompt, createUserPrompt } from "./utils.js";

const prisma = new PrismaClient()

// Sends a single question to the AI and streams the answer.
// Saves every prompt + response to the database via Prisma for history.
export async function ask(question, options, info) {
  const systemPrompt = getSystemPrompt(options.persona);
  const prompt = createUserPrompt(question, options, info);

  const responseStream = await askLLM(prompt, systemPrompt, options);

  let response = '';

  if (options.output) {
    // Stream directly to the output file; also accumulate text for the DB record.
    const spinner = ora("Saving response to file").start();
    const file = fs.createWriteStream(options.output);

    for await (const chunk of responseStream) {
      file.write(chunk.choices[0]?.delta?.content || "");
      response += chunk.choices[0]?.delta?.content || ""
    }

    file.end();

    spinner.succeed(`The response has been saved to ${options.output}`);
  } else {
    // Print each token to stdout as it arrives for a live-typing effect.
    for await (const chunk of responseStream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
      response += chunk.choices[0]?.delta?.content || ""
    }
  }

  // Persist the prompt and full response for history tracking.
  await prisma.question.create({
    data: {
      value: prompt,
      response
    },
  })
}
