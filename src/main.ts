import Anthropic from "@anthropic-ai/sdk";
import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";

const messages:Anthropic.MessageParam[] = [];
const rl = readline.createInterface({input:stdin,output:stdout});
//init of client 
const client = new Anthropic({
    baseURL:"http://localhost:11434",
    apiKey:"ollama"
});

const printLlmResponse =(content:Anthropic.Messages.ContentBlock[])=>{
    for(const block of content){
        if(block.type=="text"){
        console.log("==================================================================")
        console.log(block?.text)
        console.log("==================================================================")
        } 
        
    }
}

while(true){
const line:string = await rl.question("> ");
  if(!line.length || line=="/exit") break;
  messages.push({role:"user",content:line})
    const response:Anthropic.Messages.Message = await client.messages.create({
        model:"llama3.2:1b",
        max_tokens:1024,
        messages
  });
    messages.push({role:"assistant",content:response.content})
    printLlmResponse(response?.content) 
}


rl.close(); 
