import fs from "fs";
import ora from "ora";

import openai from "../../utils/openai.js";

// Generates a file based on the user's request

export async function generate(request, options, info) {
  let systemPrompt = ["You are a file generator. Your job is to create files based on a client's request. Make sure you only respond with valid content for the type of file that is requested.",

    "The client's requests may be vague but do your best to craft the best file you can. Go above and beyond to impress the client. Include comments in the file that explain to the client how and where to make any changes that would be required to complete the file. To be clear, your job is to complete the file as much as you possibly can given the client's request and leave comments only if you the changes are required to for the file complete to a highstandard and production ready.",

    "The client's request will be provided as the first message from the user. Read it and then respond with the content of the file they request.",

    "---",
    "# Context",
    "This section contains all the information you have to create the clien'ts request.",

    ...(options.output ? [
      "## File Name",
      `The name of the file to be created is "${options.output}"`
    ] : []),

    ...(info.pipedInput ? ["## Input (This)",
      `This is the subject of the client's request. Use this to complete the client's request. `,
      info.pipedInput
    ] : [])

  ].join('\n')

  console.log(systemPrompt)

  const stream = await openai.chat.completions.create({
    model: "o4-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: request },
    ],
    response_format: { type: "text" },
    stream: true,
  });

  const fileName = options.output || `generated-${Date.now()}.md`
  const spinner = ora("Generating file").start();
  const file = fs.createWriteStream(fileName);

  for await (const chunk of stream) {
    file.write(chunk.choices[0]?.delta?.content || "");
  }

  file.end();

  spinner.succeed(`The response has been saved to ${fileName}`);
}

