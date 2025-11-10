#!/usr/bin/env node
// Prototype: Enforce jettypod command usage - Balanced (Claude Code Protocol)
// Created: 2025-10-16
// Purpose: PreToolUse hook that blocks direct CLAUDE.md edits and suggests jettypod commands
// Decision: Updated to match actual Claude Code hook protocol

/**
 * Claude Code PreToolUse Hook
 *
 * Intercepts Edit/Write operations on CLAUDE.md and blocks
 * forbidden patterns like mode changes or current_work updates.
 *
 * Configuration (add to ~/.claude/settings.json or .claude/settings.json):
 * {
 *   "hooks": {
 *     "PreToolUse": [
 *       {
 *         "matcher": "Edit",
 *         "hooks": [
 *           {
 *             "type": "command",
 *             "command": "./prototypes/2025-10-16-enforce-jettypod-balanced-v2.js"
 *           }
 *         ]
 *       },
 *       {
 *         "matcher": "Write",
 *         "hooks": [
 *           {
 *             "type": "command",
 *             "command": "./prototypes/2025-10-16-enforce-jettypod-balanced-v2.js"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 *
 * Hook Input (via stdin):
 * {
 *   "session_id": "...",
 *   "transcript_path": "...",
 *   "cwd": "...",
 *   "hook_event_name": "PreToolUse",
 *   "tool_name": "Edit" | "Write",
 *   "tool_input": {
 *     "file_path": "/path/to/CLAUDE.md",
 *     "old_string": "original content",     // Edit only
 *     "new_string": "proposed new content", // Edit only
 *     "content": "file content"             // Write only
 *   }
 * }
 *
 * Hook Output (to stdout):
 * {
 *   "hookSpecificOutput": {
 *     "hookEventName": "PreToolUse",
 *     "permissionDecision": "allow" | "deny" | "ask",
 *     "permissionDecisionReason": "Explanation"
 *   }
 * }
 */

const fs = require('fs');

// Read hook input from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const hookInput = JSON.parse(input);
    const { tool_name, tool_input, cwd } = hookInput;

    // Only check CLAUDE.md edits
    if (!tool_input.file_path || !tool_input.file_path.endsWith('CLAUDE.md')) {
      allowEdit();
      return;
    }

    let oldContent, newContent;

    if (tool_name === 'Edit') {
      oldContent = tool_input.old_string;
      newContent = tool_input.new_string;
    } else if (tool_name === 'Write') {
      // For Write, read the current file content (if exists) to compare
      try {
        oldContent = fs.readFileSync(tool_input.file_path, 'utf8');
        newContent = tool_input.content;
      } catch (err) {
        // File doesn't exist yet - allow new file creation
        allowEdit();
        return;
      }
    } else {
      // Unknown tool
      allowEdit();
      return;
    }

    const result = checkEdit(oldContent, newContent);

    if (result.blocked) {
      denyEdit(result.message, result.suggestion);
    } else {
      allowEdit();
    }

  } catch (err) {
    // If we can't parse input, allow the edit (fail open)
    console.error('Hook error:', err.message);
    allowEdit();
  }
});

/**
 * Allow the edit
 */
function allowEdit() {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow"
    }
  }));
  process.exit(0);
}

/**
 * Deny the edit with explanation
 */
function denyEdit(message, suggestion) {
  const reason = `❌ ${message}\n\n💡 Hint: ${suggestion}`;

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason
    }
  }));
  process.exit(0);
}

/**
 * Pattern definitions for forbidden edits
 */
const FORBIDDEN_PATTERNS = [
  {
    name: 'mode_change',
    detect: (old, newStr) => {
      const oldMode = old.match(/<mode>(\w+)<\/mode>/);
      const newMode = newStr.match(/<mode>(\w+)<\/mode>/);
      return oldMode && newMode && oldMode[1] !== newMode[1];
    },
    message: 'Cannot change <mode> tag directly',
    suggestion: (old, newStr) => {
      const newMode = newStr.match(/<mode>(\w+)<\/mode>/)?.[1];
      return `Use: jettypod ${newMode}`;
    }
  },
  {
    name: 'current_work_change',
    detect: (old, newStr) => {
      const oldWork = old.match(/<current_work>[\s\S]*?<\/current_work>/);
      const newWork = newStr.match(/<current_work>[\s\S]*?<\/current_work>/);

      // Block if current_work section content changes
      if (oldWork && newWork && oldWork[0] !== newWork[0]) {
        return true;
      }

      // Block if adding/removing current_work section
      if ((!oldWork && newWork) || (oldWork && !newWork)) {
        return true;
      }

      return false;
    },
    message: 'Cannot modify <current_work> section directly',
    suggestion: (old, newStr) => {
      const workId = newStr.match(/Working on: \[#(\d+)\]/)?.[1];
      if (workId) {
        return `Use: jettypod work start ${workId}`;
      }
      return 'Use: jettypod work start <id> or jettypod work stop';
    }
  },
  {
    name: 'work_status_change',
    detect: (old, newStr) => {
      const oldStatus = old.match(/Status: (\w+)/);
      const newStatus = newStr.match(/Status: (\w+)/);
      return oldStatus && newStatus && oldStatus[1] !== newStatus[1];
    },
    message: 'Cannot change work status directly',
    suggestion: (old, newStr) => {
      const workId = newStr.match(/Working on: \[#(\d+)\]/)?.[1];
      const newStatus = newStr.match(/Status: (\w+)/)?.[1];
      if (workId && newStatus) {
        return `Use: jettypod work status ${workId} ${newStatus}`;
      }
      return 'Use: jettypod work status <id> <status>';
    }
  },
  {
    name: 'stage_change',
    detect: (old, newStr) => {
      const oldStage = old.match(/<stage>(\w+)<\/stage>/);
      const newStage = newStr.match(/<stage>(\w+)<\/stage>/);
      return oldStage && newStage && oldStage[1] !== newStage[1];
    },
    message: 'Cannot change <stage> tag directly',
    suggestion: (old, newStr) => {
      const newStage = newStr.match(/<stage>(\w+)<\/stage>/)?.[1];
      return `Use: jettypod stage ${newStage}`;
    }
  }
];

/**
 * Check if an edit should be blocked
 */
function checkEdit(oldStr, newStr) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.detect(oldStr, newStr)) {
      return {
        blocked: true,
        pattern: pattern.name,
        message: pattern.message,
        suggestion: pattern.suggestion(oldStr, newStr)
      };
    }
  }

  return { blocked: false };
}

/**
 * Test cases (run with: node prototypes/2025-10-16-enforce-jettypod-balanced-v2.js test)
 */
if (process.argv[2] === 'test') {
  console.log('Running tests...\n');

  const tests = [
    {
      name: 'Block mode change (Edit)',
      input: {
        tool_name: 'Edit',
        tool_input: {
          file_path: '/path/to/CLAUDE.md',
          old_string: '<mode>discovery</mode>',
          new_string: '<mode>speed</mode>'
        }
      },
      shouldBlock: true
    },
    {
      name: 'Block current_work addition (Edit)',
      input: {
        tool_name: 'Edit',
        tool_input: {
          file_path: '/path/to/CLAUDE.md',
          old_string: '<project_summary>test</project_summary>',
          new_string: '<current_work>Working on: [#75]</current_work>'
        }
      },
      shouldBlock: true
    },
    {
      name: 'Block status change (Edit)',
      input: {
        tool_name: 'Edit',
        tool_input: {
          file_path: '/path/to/CLAUDE.md',
          old_string: 'Status: in_progress',
          new_string: 'Status: done'
        }
      },
      shouldBlock: true
    },
    {
      name: 'Allow other edits (Edit)',
      input: {
        tool_name: 'Edit',
        tool_input: {
          file_path: '/path/to/CLAUDE.md',
          old_string: '<mission>Old mission</mission>',
          new_string: '<mission>New mission</mission>'
        }
      },
      shouldBlock: false
    },
    {
      name: 'Allow non-CLAUDE.md edits',
      input: {
        tool_name: 'Edit',
        tool_input: {
          file_path: '/path/to/src/index.js',
          old_string: 'const x = 1',
          new_string: 'const x = 2'
        }
      },
      shouldBlock: false
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const toolInput = test.input.tool_input;
    const oldStr = toolInput.old_string || '';
    const newStr = toolInput.new_string || '';

    // Skip file check for testing
    const isClaudeMd = toolInput.file_path.endsWith('CLAUDE.md');
    const result = isClaudeMd ? checkEdit(oldStr, newStr) : { blocked: false };
    const matches = result.blocked === test.shouldBlock;

    if (matches) {
      console.log(`✅ ${test.name}`);
      if (result.blocked) {
        console.log(`   Message: ${result.message}`);
        console.log(`   Suggestion: ${result.suggestion}`);
      }
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Expected blocked=${test.shouldBlock}, got blocked=${result.blocked}`);
      failed++;
    }
    console.log();
  });

  console.log(`Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
