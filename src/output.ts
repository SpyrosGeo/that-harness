import Anthropic from "@anthropic-ai/sdk";
export const displayResponse = (content: Anthropic.Messages.ContentBlock[]) => {
  for (const block of content) {
    if (block.type == "text") {
      console.log(
        "==================================================================",
      );
      console.log("--", block?.text);
      console.log(
        "==================================================================",
      );
    }
    if (block?.type == "tool_use") {
      console.dir(block, { depth: null });
    }
  }
};
