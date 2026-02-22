import { transcribe } from "./transcribe.js";

// Registers the `transcribe` subcommand, which converts an audio file to text
// using OpenAI's Whisper model.
export default function addTranscribeToProgram(program) {
  program
    .command("transcribe")
    .description("Transcribe an audio file")
    .argument("<audioFile>", "The audio file to transcribe")
    .option("-o, --output <output>", "The file to save the transcription to")
    .action((audioFile, options) => {
      transcribe(audioFile, options);
    });
}
