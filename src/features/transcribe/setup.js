import { transcribe } from "./transcribe.js";

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
