# Terminal AI

<p align="center">
  <img src="./assets/banner.png" width="400" />
</p>

Terminal AI is a command-line interface (CLI) tool that allows you to utilize the AI models provided by OpenAI in an easy to use way. It allows you to ask any kind of questions and generate content (text, images and audio) straight from the terminal. This tool defaults to using GPT-4, one of OpenAI's models.

## Prerequisites

- Node.js installed in the system
- OpenAI API keys

## Installation

Execute the following command to install dependencies:
```bash
npm install
```
and put your OpenAI API key in a `.env` file:

```bash
OPENAI_API_KEY={your-api-key}
OPENAI_ORG_ID={your-org-id}
```

### Installing Globally

Run `npm install -g` from the terminal-ai root directory. This makes the `terminal-ai` command available anywhere.

*TIP:* I like to set an alias in my .zshrc like so: `alias ai="terminal-ai"` so I don't have to type out "terminal-ai" every time.

## Usage

You can run `terminal-ai` without any additional arguments to get a list of available sub commands.

### ask
The `ask` subcommand allows you to ask terminal-ai a question and recieve an answer.

```bash
terminal-ai ask "What is the meaning of life?" -o output.txt
```

This will ask the question "What is the meaning of life?" to the AI model and output the response to the output.txt file.

```bash
terminal-ai ask "What is the meaning of life?" -f input.txt
```

This will read the input.txt file and ask a question based on it.

### imagine
The `imagine` subcommand can be used to generate images from a text prompt.

### speak
The `speak` subcommand allows you to generate audio from text

## Commands

1. `ask`: Ask a question. This command takes a question as an argument and optionally an output file and an input file.
  - `-o, --output <output>`: Output the response to a file
  - `-f, --file <file>`: An input file to ask the question about

```bash
terminal-ai ask "What is the meaning of life?" -o output.txt -f input.txt
```

-----
I hope you find this tool beneficial to your day to day work.

