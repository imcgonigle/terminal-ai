import readline from "readline"

// Wraps Node's readline interface in a Promise so callers can use async/await
// to ask the user a question and receive their answer from stdin.
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
