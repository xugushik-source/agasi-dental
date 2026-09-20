# Agent goal

Describe what this agent should do. The whole of GOAL.md is the agent's
prompt — there's no frontmatter or structured fields, just plain English.

Some good things to include:

- The end state you want when the agent succeeds
- Inputs the agent should expect (CLI args, files, API responses)
- Anything the agent should **not** do
- The format of the report / output the agent should produce

## Decision policy

Adapt these defaults to the risk and scope of this agent:

- Proceed without asking when the work is within scope and a safe, reversible choice exists.
- Ask when a missing human decision changes what the correct result should be.
- Retain when the work is complete but all changes should be reviewed before merge.
- Request merge only when the result is complete, verified, and clearly safe for this agent's scope.
- Discard when the run produced no useful changes or deliberately abandoned them.
