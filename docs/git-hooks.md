# Git Hooks Documentation

## Overview

This project uses **Husky** and **lint-staged** to automate code quality checks before commits. These tools ensure that all committed code follows our coding standards and is properly formatted.

## What Happens When You Commit

When you run `git commit`, the following automatic process occurs:

1. **Pre-commit hook runs** (via Husky)
2. **lint-staged processes** only the files you've staged
3. **ESLint fixes** are applied to TypeScript/JavaScript files
4. **Prettier formats** all applicable files
5. **Files are automatically updated** with fixes
6. **Commit proceeds** if no blocking errors remain

## Supported File Types

### TypeScript/JavaScript (`*.{ts,tsx,js,jsx}`)
- **ESLint**: Runs with `--fix` to auto-fix linting issues
- **Prettier**: Formats code according to project style rules

### Other Formats (`*.{css,json,md}`)
- **Prettier**: Formats CSS, JSON, and Markdown files

## Configuration Files

### `.husky/pre-commit`
```bash
#!/usr/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### `package.json` (lint-staged section)
```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,json,md}": [
    "prettier --write"
  ]
}
```

## Common Scenarios

### Scenario 1: Auto-fixable Issues
If your staged files have fixable ESLint issues (like missing semicolons, unused variables, etc.), they will be automatically fixed and the commit will proceed.

**Example:**
```javascript
// Before commit
const x = 5  // Missing semicolon

// After pre-commit hook runs
const x = 5; // Semicolon added automatically
```

### Scenario 2: Blocking Issues
If ESLint finds errors that can't be auto-fixed, the commit will be blocked with an error message. You'll need to fix these manually and try again.

**Example of blocking errors:**
- Syntax errors
- Type errors in TypeScript
- Unresolved imports

### Scenario 3: No Issues
If your staged files are already clean, the hooks run quickly and the commit proceeds normally.

## Performance

- **Fast**: Hooks typically complete in 1-3 seconds
- **Selective**: Only processes staged files, not entire codebase
- **Parallel**: Multiple file types processed simultaneously

## Troubleshooting

### Hook Doesn't Run
```bash
# Ensure husky is installed
npm install

# Re-initialize if needed
npx husky install
```

### Commit Fails with ESLint Errors
1. Read the error messages carefully
2. Fix the issues manually in your editor
3. Stage the fixed files: `git add .`
4. Try committing again

### Hook Runs Slowly
- This usually means many files are staged
- Consider making smaller, focused commits
- Check if ESLint configuration needs optimization

### Bypassing Hooks (Not Recommended)

In emergency situations, you can bypass hooks:
```bash
git commit --no-verify -m "Emergency commit"
```

**Warning**: Use `--no-verify` sparingly. It skips all quality checks and should only be used for emergency fixes.

## Best Practices

1. **Stage relevant files only**: Don't stage files you're not working on
2. **Review hook output**: See what was automatically fixed
3. **Fix blocking issues promptly**: Don't let errors accumulate
4. **Make smaller commits**: Easier to review and faster hooks
5. **Keep tools updated**: Regular updates improve performance and features

## Installation for New Team Members

If you're setting up the project for the first time:

1. Install dependencies: `npm install`
2. Husky is automatically configured via the `prepare` script
3. Git hooks will be active on your first commit

## Files Modified by Hooks

When hooks run, they may modify your staged files. The changes are:
- **Automatic**: Applied without manual intervention
- **Safe**: Only formatting and simple fixes
- **Staged**: Changes are automatically added to your commit

You'll see output like:
```
Running tasks for staged files...
  *.{ts,tsx,js,jsx} - 3 files
    eslint --fix
    prettier --write
```

## Questions?

If you have issues with the git hooks:
1. Check this documentation first
2. Look at the error messages carefully
3. Ask the team for help with persistent issues
4. Consider improving this documentation if you find gaps
