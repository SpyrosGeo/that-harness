# TODO LIST FOR MY LITTLE HARNESS

## Levenshtein function (https://en.wikipedia.org/wiki/Levenshtein_distance)

Check this way to determine how to handle commands with typos

# Next steps

Next: Stage 3b, run the tool and send back the result

1. ~~Fix the path description (src/tools.ts:11). Ask for a path relative to the project folder, like package.json, not "absolute starting from ~/".~~ (done)
2. ~~Tighten the tool description (src/tools.ts:5). Say when not to use the tool: "Only use this when the user names a specific file."~~ (done)
3. ~~Write the read_file function. It takes the input from a tool_use block and reads the file with Node's fs/promises readFile. It returns the contents as a string.~~ (done)
4. ~~Validate the input. Check that path exists and is a string before reading. Never trust input blindly.~~ (done)
5. ~~Handle failures. For a missing file, a wrong path or a bad input, return an error message. Don't throw and crash.~~ (done)
6. Connect tool_use blocks to your function. After each response, find the tool_use blocks and pick the matching function by name.
7. Build the tool_result block. It needs type: "tool_result", a tool_use_id equal to the id of the tool_use block, and content. Add is_error: true when it failed. See ToolResultBlockParam in messages.d.ts:4589.
8. Push it as a user message. The tool_result goes into messages with role: "user", right after the assistant message that contains the tool_use.
9. Call the model again, so it can answer using the result.
10. Test: ask about package.json (should work) and about hello (should return an error result, not crash).

Open cleanups from today

- Spaces-only lines: trim line before the empty check (src/main.ts:49).
- Unknown commands: if a line starts with / but isn't a command, print "Unknown command" and the list of commands.
- /new versus /clear: decide on the name, or add /clear as a second name.
- handleCommand return type: add an explicit type (src/main.ts:32). Optionally, move the /new work into its case.
- /models: implement it (list or switch models), or remove it from COMMANDS for now.
- Check /think: run ollama show qwen3:1.7b --template and look for /think.
- Optional: a levenshtein function for "Did you mean ...?" suggestions.

Later stages

- Stage 4, the agent loop: keep calling the model while stop_reason === "tool_use". Add a maximum number of steps, so a confused model can't loop forever.
- Stage 5, more tools: list_files, write_file, run_command, with a permission check before anything dangerous runs.
- Stage 6, polish: a system prompt, streaming output, error handling around create (remove the user line from the history if the request fails), and handling the 4096-token context limit.

When you start on Stage 3b, begin with item 1. Paste your new path description, and we'll go from there
