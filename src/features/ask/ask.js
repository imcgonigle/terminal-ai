import fs from "fs";
import ora from "ora";
import pkg from '@prisma/client'
const { PrismaClient } = pkg

import { askLLM, getSystemPrompt, createUserPrompt } from "./utils.js";

const prisma = new PrismaClient()

export async function ask(question, options, info) {
  const systemPrompt = getSystemPrompt(options.persona);
  const prompt = createUserPrompt(question, options, info);

  const responseStream = await askLLM(prompt, systemPrompt, options);

  let response = '';

  if (options.output) {
    const spinner = ora("Saving response to file").start();
    const file = fs.createWriteStream(options.output);

    for await (const chunk of responseStream) {
      file.write(chunk.choices[0]?.delta?.content || "");
      response += chunk.choices[0]?.delta?.content || ""
    }

    file.end();

    spinner.succeed(`The response has been saved to ${options.output}`);
  } else {
    for await (const chunk of responseStream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
      response += chunk.choices[0]?.delta?.content || ""
    }
  }

  await prisma.question.create({
    data: {
      value: prompt,
      response
    },
  })
}
