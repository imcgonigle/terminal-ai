import readline from "readline"

export default (prompt) => new Promise((resolve) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(prompt, (answer) => {
    rl.close();
    resolve(answer);
  });
});

