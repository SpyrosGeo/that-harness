import Anthropic from "@anthropic-ai/sdk";
export interface  CreateCall extends Anthropic.MessageCreateParamsNonStreaming {
    client:Anthropic
    
}
export const createCall  = async({client,model,messages,tools,max_tokens=1024}:CreateCall):Promise<Anthropic.Messages.Message> =>{
return client.messages.create({
    model,
    max_tokens,
    messages,
    tools,
  });
}