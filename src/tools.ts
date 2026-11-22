import Anthropic from "@anthropic-ai/sdk";
export const readFileTool: Anthropic.Tool = {
  name: "read_file",
  description:
    "A tool for reading all kinds of files. This tool should be used when the user specifically asks for the contents of the file or it is needed to answer the user a question related to this file",
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path should be absolute starting from ~/ every time",
      },
    },
    required: ["path"],
  },
};
