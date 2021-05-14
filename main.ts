//====================================
// Linux' Font Helper wrote in Deno.
// Lucas Castro <contato@lucascastro.dev>
// GNU GPLv3

// run: deno run --allow-net --allow-run --allow-read main.ts
// dependencies: deno, bash
//====================================

import { Application, helpers, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const PORT = 18412;
const ALLOWEDTYPES = "\\.ttf\\|\\.otf";
const VERSION = 17;

// interfaces
interface IFont {
  localizedFamily: string;
  postscript: string;
  style: string;
  weight: string;
  stretch: number;
  italic: boolean;
  family: string;
  localizedStyle: string;
}

interface IResponse {
  fontFiles: Record<string, Array<IFont>>;
  version: number;
}

// list of fonts to be used by figma
const response: IResponse = {
  fontFiles: {},
  version: VERSION,
};

// uses fc-list to gather all allowed fonts from the system, formatted in the following pattern
const cmd = Deno.run({
  cmd: [
    "bash",
    "-c",
    `fc-list --format '%{file}|%{family[0]}|%{weight}|%{style[0]}|%{postscriptname}\\n' | sort | grep -e ${ALLOWEDTYPES}`,
  ],
  stdout: "piped",
  stderr: "piped",
});

// formats all fonts into the required format to be used by figma
new TextDecoder().decode(await cmd.output()).split("\n").forEach((font) => {
  const info = font.split("|"); // splits all font data into an array
  if (info.length == 5) {
    if (response.fontFiles[info[0]] == undefined) { // todo: refactor this
      response.fontFiles[info[0]] = new Array<IFont>();
    }

    // pushes the formatted font into the array
    response.fontFiles[info[0]].push({
      localizedFamily: info[1],
      postscript: info[4],
      style: info[3],
      weight: info[2],
      stretch: 5, // default stretch value
      italic: info[3] == "Italic" || info[3] == "Oblique", // figma reads italics as a boolean
      family: info[1],
      localizedStyle: info[3],
    });
  }
});

cmd.close();

const router = new Router();
router
  // url used by figma to get a list of all available fonts, called when a project is open
  .get("/figma/font-files", (context) => {
    context.response.headers.set("Content-Type", "application/json");
    context.response.body = JSON.stringify(response);
  })
  // when the user selects a font, figma call this url to download the font as an octet-stream
  .get("/figma/font-file", async (context) => {
    const file: string = helpers.getQuery(context).file;
    context.response.headers.set("Content-Type", "application/json");
    if (response.fontFiles[file] != null) {
      context.response.type = "application/octet-stream";
      context.response.body = await Deno.readFile(
        file,
      );
    }
  });

const app = new Application();
// cors setup
app.use(
  oakCors({
    origin: "https://www.figma.com",
  }),
);

app.use(router.routes());
app.use(router.allowedMethods());

// starts server
await app.listen(`127.0.0.1:${PORT}`);
