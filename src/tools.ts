import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
type FileContent = { text: string; is_error: boolean };

export const readFileTool: Anthropic.Tool = {
  name: "read_file",
  description:
    "A tool for reading all kinds of files. This tool should  only be used when the user specifically asks for the contents of a specified file.",
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Relative to the project folder, e.g. package.json or src/main.ts",
      },
    },
    required: ["path"],
  },
};

export const readFileImpl = async (input: any) => {
  let fileContent: FileContent = {
    text: "",
    is_error: false,
  };
  if (typeof input?.path !== "string" || !input?.path?.length) {
    fileContent.text =
      'Invalid input: "path" must be a non-empty string, e.g. "package.json" or "src/main.ts".';
    fileContent.is_error = true;
    return fileContent;
  }

  try {
    fileContent.text = await readFile(input?.path, "utf-8");
  } catch (error: any) {
    fileContent.text = error.message;
    fileContent.is_error = true;
  }
  return fileContent;
};
