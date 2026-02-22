import fs from "fs";
import ora from "ora";
import pkg from '@prisma/client'
const { PrismaClient } = pkg

import { askLLM, getSystemPrompt, createUserPrompt } from "./utils.js";

const prisma = new PrismaClient()

// Sends a one-shot question to the AI and streams the response.
// If --output is set the response is written to a file; otherwise it is printed
// to stdout. Every question and its response are persisted to the database via
// Prisma so they can be reviewed later.
export async function ask(question, options, info) {
  const systemPrompt = getSystemPrompt(options.persona);
  const prompt = createUserPrompt(question, options, info);

  const responseStream = await askLLM(prompt, systemPrompt, options);

  let response = '';

  if (options.output) {
    // Write the streamed response directly to the output file chunk by chunk,
    // also accumulating it in `response` for database storage.
    const spinner = ora("Saving response to file").start();
    const file = fs.createWriteStream(options.output);

    for await (const chunk of responseStream) {
      file.write(chunk.choices[0]?.delta?.content || "");
      response += chunk.choices[0]?.delta?.content || ""
    }

    file.end();

    spinner.succeed(`The response has been saved to ${options.output}`);
  } else {
    // Stream each token directly to stdout as it arrives for a real-time feel.
    for await (const chunk of responseStream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
      response += chunk.choices[0]?.delta?.content || ""
    }
  }

  // Persist the full prompt and response to the database for history tracking.
  await prisma.question.create({
    data: {
      value: prompt,
      response
    },
  })
}
