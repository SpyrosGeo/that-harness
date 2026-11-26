import Anthropic from "@anthropic-ai/sdk";
import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";
import { readFileImpl, readFileTool } from "./tools";
import { displayLlmTextResponse } from "./output";
import { COMMANDS, isCommand } from "./commands";
import { createCall, CreateCall } from "./call";
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
  const callObj:CreateCall={
    client,
    model,
    max_tokens:1024,
      tools:[readFileTool],
      messages
  }
  messages.push({ role: "user", content: line });
  while(true) {
    const toolResults = await handleLlmResponse(await createCall(callObj))
    if(!toolResults.length)break;
    messages.push({role:'user',content:toolResults})
  } 
};
const handleLlmResponse = async(response:Anthropic.Messages.Message):Promise<Anthropic.ToolResultBlockParam[]> =>{
  const {role,content,stop_reason} = response;
  messages.push({role,content})
  const toolResults:Anthropic.ToolResultBlockParam[] = [];
  for(const block of content){
    if(block.type=='text')displayLlmTextResponse(block.text,role=='assistant')
    if(block.type=='tool_use'){
      const {text,is_error} = block.name==readFileTool.name? await readFileImpl(block.input):{text:`Uknown Tool:${block.name}`,is_error:true}
      toolResults.push({tool_use_id:block.id,type:"tool_result",content:text,is_error:is_error})
    }
  }
  if(stop_reason) console.log('stop_reason',stop_reason)
  return toolResults
  

}
while (true) {
  const line: string = await rl.question("> ");
  if (!line?.length) continue;
  if (isCommand(line)) {
    if (line == COMMANDS.EXIT) break;
    if (line == COMMANDS.NEW) messages.length = 0;
    continue;
  }
  await callToLlm(line);
}
rl.close();
