import { spawn } from "node:child_process";

const forwarded = process.argv.slice(2);
const args = ["dev"];

for (let index = 0; index < forwarded.length; index += 1) {
  const argument = forwarded[index];
  if (argument === "--host") {
    args.push("--hostname", forwarded[index + 1]);
    index += 1;
  } else if (argument !== "--strictPort") {
    args.push(argument);
  }
}

const child = spawn("next", args, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
