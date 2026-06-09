import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { templates } from "../src/emails/templates.js";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(rootDir, "email-previews");

const previews = [
  {
    fileName: "welcome.html",
    render: () => templates.welcome({ firstName: "Thomas" }),
  },
  {
    fileName: "premium-activated.html",
    render: () => templates.premiumActivated(),
  },
];

await mkdir(outputDir, { recursive: true });

for (const preview of previews) {
  const { subject, html } = preview.render();
  const document = html.replace(
    "</head>",
    `<meta name="x-email-subject" content="${subject.replace(/"/g, "&quot;")}">\n</head>`,
  );

  await writeFile(resolve(outputDir, preview.fileName), document, "utf8");
  console.log(`Generated ${preview.fileName}: ${subject}`);
}
