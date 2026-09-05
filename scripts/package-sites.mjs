import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/client", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await cp("out", "dist/client", { recursive: true });

try {
  await access(".openai/hosting.json");
  await cp(".openai/hosting.json", "dist/.openai/hosting.json");
} catch {
  // ChatGPT Sites provides this file in its hosting environment. Standard CI,
  // Vercel and local builds should still succeed when it is not present.
}

const worker = `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && !url.pathname.includes(".")) {
      const fallback = new URL("/index.html", url);
      response = await env.ASSETS.fetch(new Request(fallback, request));
    }
    return response;
  }
};
`;

await writeFile("dist/server/index.js", worker.trimStart());
