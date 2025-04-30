import readline from "readline"

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
