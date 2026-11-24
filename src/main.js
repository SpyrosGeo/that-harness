import Anthropic from "@anthropic-ai/sdk";
import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";
import { readFileTool } from "./tools";
import { displayResponse } from "./output";
import { COMMANDS, isCommand } from "./commands";
const messages = [];
const rl = readline.createInterface({ input: stdin, output: stdout });
//init of client
const client = new Anthropic({
    baseURL: "http://localhost:11434",
    apiKey: "ollama",
});
const callToLlm = async (line, model = "qwen3:1.7b") => {
    messages.push({ role: "user", content: line });
    const response = await client.messages.create({
        model,
        max_tokens: 1024,
        messages,
        tools: [readFileTool],
    });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason?.length) {
        console.log(response?.stop_reason);
    }
    displayResponse(response?.content);
};
const handleCommand = (cmd) => {
    switch (cmd) {
        case COMMANDS.EXIT:
            return "exit";
        case COMMANDS.NEW:
            return "clear";
        case COMMANDS.MODELS:
            return "models";
        default: {
            const unreachable = cmd;
            return unreachable;
        }
    }
};
while (true) {
    const line = await rl.question("> ");
    if (!line?.length)
        continue;
    if (isCommand(line)) {
        const result = handleCommand(line);
        if (result == "exit")
            break;
        if (result == "clear")
            messages.length = 0;
        continue;
    }
    await callToLlm(line);
}
rl.close();
