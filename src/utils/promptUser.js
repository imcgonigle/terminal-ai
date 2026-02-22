import readline from "readline"

// Prints `prompt` to stdout and resolves with the user's typed answer.
// Wraps readline in a Promise so callers can use async/await.
export default async function promptUser(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // rl.resume()
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
