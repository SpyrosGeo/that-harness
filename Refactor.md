# Refactor TODO

## Tool registry

- [ ] Replace the hardcoded `readFileImpl` call in `src/main.ts` (tool_use branch) with a lookup by `block.name`.

**Why:** Right now every `tool_use` block runs `readFileImpl`, no matter which tool the model asked for. Once a second tool exists (Stage 5), the wrong function would run. Adding a tool also means editing two places (the `tools: [...]` array and the dispatch), and these can get out of sync.

**Steps:**

1. In `src/tools.ts`, add a single map from tool name to its definition and implementation:

   ```ts
   type ToolImpl = (input: unknown) => Promise<FileContent>;

   export const TOOLS: Record<string, { def: Anthropic.Tool; run: ToolImpl }> = {
     read_file: { def: readFileTool, run: readFileImpl },
   };
   ```

2. In `src/main.ts`, build the tools list from the map:

   ```ts
   tools: Object.values(TOOLS).map((t) => t.def),
   ```

3. In `src/main.ts`, dispatch by name and handle unknown tools:

   ```ts
   if (block.type === "tool_use") {
     const tool = TOOLS[block.name];
     const result = tool
       ? await tool.run(block.input)
       : { text: `Unknown tool: ${block.name}`, is_error: true };
     displayLlmTextResponse(result.text, true);
   }
   ```

**Notes:**

- The map key must match `def.name`. Keep them in sync by hand (fine for a few tools).
- Small models can invent tool names. The unknown-tool branch returns an error instead of running the wrong function.
- `result` already has `text` and `is_error`, so it maps directly onto the `tool_result` block for Stage 3b (TODO.md step 7). Add `tool_use_id: block.id`.

## Drop `determineCommand`

- [ ] Remove `determineCommand` from `src/commands.ts` and handle commands directly in `src/main.ts`.

**Why:** It only maps one string to another, and `main.ts` then checks that string again. That's two layers for one decision.

**Steps:**

1. In `src/main.ts`, replace the command block with:

   ```ts
   if (isCommand(line)) {
     if (line === COMMANDS.EXIT) break;
     if (line === COMMANDS.NEW) messages.length = 0;
     continue;
   }
   ```

2. Import `COMMANDS` instead of `determineCommand`.
3. Delete `determineCommand` from `src/commands.ts`.

**Notes:**

- `/models` does nothing today. Either implement it or remove it from `COMMANDS` until it works.

## Clean up `readFileImpl`

- [ ] Simplify `readFileImpl` in `src/tools.ts`.

**Steps:**

1. Type the parameter as `input: unknown` instead of `any`. The existing check already narrows it.
2. Return object literals instead of mutating `let fileContent`.
3. Inside the `try`, use `input.path` without `?.`, because the input is already validated.

**Notes:**

- Keep the `is_error` name. It matches the `tool_result` field in the API.

## Fix `displayLlmTextResponse`

- [ ] Fix the unused `tool` parameter in `src/output.ts`.

**Why:** No caller passes `tool`, so `"--"` never prints. Also, `console.log("", text)` adds a leading space.

**Steps:**

1. Pass `true` at the tool_use call site, or remove the parameter.
2. Avoid the leading space, for example `console.log(tool ? "-- " + text : text)`.

## Move model and client config into constants

- [ ] Move the model list and `baseURL` out of `src/main.ts` function signatures.

**Why:** The model union type lives in the `callToLlm` signature. A `MODELS` constant can be reused when `/models` is implemented.

**Steps:**

1. Add a constant, for example `export const MODELS = ["llama3.2:1b", "qwen3:1.7b"] as const;`.
2. Derive the type: `type Model = (typeof MODELS)[number];`.
3. Move `baseURL` next to it.

## Remove stray `.js` files in `src/`

- [ ] Delete `src/main.js`, `src/output.js` and `src/tools.js`, or add them to `.gitignore`.

**Why:** They look like old `tsc` output. The project runs `.ts` with `tsx`, so these files drift out of sync with the sources.

## Add a `tsconfig.json`

- [ ] Add a `tsconfig.json` so `npx tsc --noEmit` type-checks the project.

**Why:** Without it, `tsc` prints its help text and checks nothing.

**Notes:**

- Use `"noEmit": true` so `tsc` doesn't create `.js` files in `src/` again.
