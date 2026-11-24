export const displayLlmTextResponse = (text: string, tool = false) => {
  console.log(
    "==================================================================",
  );
  console.log(tool ? "--" : "", text);
  console.log(
    "==================================================================",
  );
};
