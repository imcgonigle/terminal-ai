# Terminal AI

<p align="center">
  <img src="./assets/banner.png" width="400" />
</p>

With Terminal AI you can generate content (text, images and audio), ask questions, chat and run complex workflows straight from your terminal.

## Prerequisites

- Node.js installed in the system
- OpenAI API keys

## Setup

Start by copying `config.example.js` to `config.js`

```bash
cp config.example.js config.js
```

Next you need to add your OpenAI API key to `config.js`.

Then install dependencies:

```bash
npm install
```

### Installing Globally

Run `npm install -g` from the terminal-ai root directory. This makes the `ai` command available anywhere.

## Usage

`$ ai --help` for a full list of commands and how to use them

### Commands

- ask - Ask the LLM a question
- chat - Chat with an LLM
- imagine - Create and edit images
- speak - Generate speech from text
- generate - Generate files from your instructions
- transcribe - Transcribe an audio file
- explain - Explain a file

---

I hope you find this tool beneficial to your day to day work.
