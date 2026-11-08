# Angular CLI MCP Server

The Angular CLI includes a **Model Context Protocol (MCP) server** that lets AI assistants (such as Cursor, Antigravity, and JetBrains AI) interact with the Angular CLI. It provides "tools for code generation, workspace analysis, and running builds/tests."

## Starting the server

```bash
npx @angular/cli mcp
```

MCP clients usually launch the server for you via their configuration, rather than you running it manually.

## Client configuration

Add an MCP server entry pointing at `npx -y @angular/cli mcp`.

**Antigravity** — `.antigravity/mcp.json`:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

**VS Code** — `.vscode/mcp.json` (note the `servers` key instead of `mcpServers`):

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

## Command options

Pass these in the config's `args` array:

- `--read-only` — Expose only non-modifying tools.
- `--local-only` — Expose only tools that do not require internet access.

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp", "--read-only"]
    }
  }
}
```

## Tools exposed

| Tool | Purpose |
|------|---------|
| `ai_tutor` | Interactive AI-powered Angular tutor. |
| `devserver.start` | Starts the dev server asynchronously. |
| `devserver.stop` | Stops the dev server. |
| `devserver.wait_for_build` | Returns recent build logs. |
| `get_best_practices` | Retrieves the Angular Best Practices Guide. |
| `list_projects` | Lists applications/libraries in the workspace. |
| `onpush_zoneless_migration` | Migration analysis and planning (OnPush / zoneless). |
| `run_target` | Executes configured targets (build, test, lint, etc.). |
| `search_documentation` | Searches the official Angular documentation. |

## Best practices

- Let the MCP client spawn the server from its config (`command` + `args`) rather than running `npx @angular/cli mcp` by hand.
- Pin the `-y` flag in `args` so `npx` runs non-interactively without a prompt.
- Use `--read-only` when you only want analysis/search tools and want to prevent the assistant from modifying the workspace.
- Use `--local-only` in offline or restricted environments to disable internet-dependent tools.
- Prefer `get_best_practices` and `search_documentation` for grounded, version-correct guidance instead of relying on the model's memory.

## Common mistakes

- Using the wrong top-level key for the editor: VS Code expects `servers`, while Antigravity/Cursor expect `mcpServers`.
- Omitting `-y` from the `npx` args, causing the launch to hang on an install confirmation prompt.
- Expecting modifying tools (e.g. generation, `run_target`) to be available when the server was started with `--read-only`.
- Pointing the config at a global path instead of `npx`, so the server version drifts from the project's CLI.
- Assuming internet-dependent tools work under `--local-only`.
