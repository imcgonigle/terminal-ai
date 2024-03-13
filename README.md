# Terminal AI

Terminal AI is a command-line interface (CLI) tool that allows you to utilize the AI models provided by OpenAI in a friendly way. It allows you to ask any kind of questions and generate contents. This tool is specifically implemented to communicate with GPT-4, one of OpenAI's models.

![Banner](http://url-of-banner-img-if-any)

## Prerequisites

- Node.js installed in the system
- OpenAI API keys

## Installation

Execute the following command to install:
```bash
npm install
```
and put your OpenAI API key in a `.env` file:

```bash
OPENAI_API_KEY={your-api-key}
OPENAI_ORG_ID={your-org-id}
```

## Usage

```bash
#!/usr/bin/env node
node index.js ask "What is the meaning of life?" -o output.txt
```

This will ask the question "What is the meaning of life?" to the AI model and output the response to the output.txt file.

```bash
node index.js ask "What is the meaning of life?" -f input.txt
```

This will read the input.txt file and ask a question based on it.

## Features

- Ask question to OpenAI's GPT-4 model right from your terminal
- Able to read files and ask question based on them
- Able to output the responses to a file
- Stream the responses in console realtime

## Commands

1. `ask`: Ask a question. This command takes a question as an argument and optionally an output file and an input file.
  - `-o, --output <output>`: Output the response to a file
  - `-f, --file <file>`: An input file to ask the question about

```bash
node index.js ask "What is the meaning of life?" -o output.txt -f input.txt
```

-----
Hope this tool becomes beneficial to your AI projects.