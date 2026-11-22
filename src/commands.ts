export const COMMANDS = {
  EXIT: "/exit",
  MODELS: "/models",
  NEW: "/new",
} as const;

export type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

export const isCommand = (line: string): line is Command => {
  const commandValues: readonly string[] = Object.values(COMMANDS);
  return commandValues.includes(line);
};
