import Anthropic from "@anthropic-ai/sdk";
import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";
import { readFileImpl, readFileTool } from "./tools";
import { displayLlmTextResponse } from "./output";
import { COMMANDS, isCommand, type Command } from "./commands";
const messages: Anthropic.MessageParam[] = [];
const rl = readline.createInterface({ input: stdin, output: stdout });
//init of client
const client = new Anthropic({
  baseURL: "http://localhost:11434",
  apiKey: "ollama",
});

const callToLlm = async (
  line: string,
  model: "llama3.2:1b" | "qwen3:1.7b" = "qwen3:1.7b",
) => {
  messages.push({ role: "user", content: line });
  const response: Anthropic.Messages.Message = await client.messages.create({
    model,
    max_tokens: 1024,
    messages,
    tools: [readFileTool],
  });
  messages.push({ role: "assistant", content: response.content });
  if (response.stop_reason?.length) {
    console.log(response?.stop_reason);
  }
  for (const block of response.content) {
    if (block.type === "text") {
      displayLlmTextResponse(block.text);
    }
    if (block.type === "tool_use") {
      //TODO determine tool by name and call the correct method for the tool
      const fileContent = await readFileImpl(block.input);
      displayLlmTextResponse(fileContent.text);
    }
  }
};
const handleCommand = (cmd: Command) => {
  switch (cmd) {
    case COMMANDS.EXIT:
      return "exit";
    case COMMANDS.NEW:
      return "clear";
    case COMMANDS.MODELS:
      return "models";
    default: {
      const unreachable: never = cmd;
      return unreachable;
    }
  }
};

while (true) {
  const line: string = await rl.question("> ");
  if (!line?.length) continue;
  if (isCommand(line)) {
    const result = handleCommand(line);
    if (result == "exit") break;
    if (result == "clear") messages.length = 0;
    continue;
  }
  await callToLlm(line);
}
rl.close();
