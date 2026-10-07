# 🚫 Auto Unapprove Reviews Action

![GitHub Action](https://github.com/RotemK1/auto-unapprove/actions/workflows/create-release.yml/badge.svg?branch=main)
![GitHub repo size](https://img.shields.io/github/repo-size/RotemK1/auto-unapprove)
![Github open issues](https://img.shields.io/github/issues-raw/RotemK1/auto-unapprove)
![GitHub all releases](https://img.shields.io/github/downloads/RotemK1/auto-unapprove/total)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

GitHub Action for **smart dismissal** of pull request reviews when code owners modify files after approval or when reviewers approve their own changes.

## **Problem & My Solution** 
![Dismiss stale pull request approvals option](images/dismiss-approvals.png)

As a DevOps engineer working with large monorepos, I've often encountered a frustrating limitation in GitHub's PR review system.
When new commits are pushed to a PR, GitHub only offers two options:
1. keep all approvals
2. dismiss all approvals.
This binary choice becomes particularly problematic in monorepos where multiple teams own different parts of the codebase

To solve this, I developed a GitHub Action called "Auto Unapprove Reviews" that provides granular control over review dismissals. Here's how it works:

The action follows a simple but effective flow:

1. Get PR information
2. Check changed files
3. Check team ownership
4. Analyze review status
5. Take appropriate action

![Dismiss in PR](images/dismiss-in-pr.png)


## 📁 **File Structure**

```
dismiss-reviews/
├── 🎯 **Core Files**
│   ├── src/index.js          # GitHub Action entry point
│   ├── action.yml            # Action definition
│   └── package.json          # Dependencies
│
├── 🚀 **Main Script**
│   └── auto-unapprove.js    # ⭐ Smart dismissal with stale detection
│
├── 📝 **Examples & Documentation**
│   ├── examples/basic-usage.md     # Usage examples and setup
│   └── examples/workflow-example.yml  # Sample GitHub Actions workflow
│
├── 🧪 **Demo & Testing**
│   └── test-team-info.js     # Demo of team information features
│
└── 📦 **Build Artifacts**
    └── dist/                 # Compiled action bundle
```

## 🚀 **Main Script Features**

**`auto-unapprove.js`** - Smart dismissal with advanced features:
- ✅ **Stale approval detection** - Dismisses approvals when files are modified after approval
- ✅ **Team membership validation** - Supports GitHub team-based code ownership
- ✅ **Precise file matching** - Only dismisses when owned files are actually modified
- ✅ **Performance optimized** - Parallel API calls and efficient caching
- ✅ **Comprehensive logging** - Detailed analysis and reasoning for each decision

## 🚀 **Quick Start**

### **Option 1: GitHub Action** (Recommended)
```yaml
- name: Smart dismiss reviews
  uses: ./
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    pr-number: ${{ github.event.number }}
    dry-run: 'false'
    code-owners-file: '.codeowners'  # Optional: custom path
    target-branch: ${{ github.event.pull_request.base.ref }}  # Optional: target branch
    team-start-with: '@'  # Optional: team prefix
```

### **Option 2: Direct Script**
```bash
# Set environment variables
export GITHUB_TOKEN="your_token"
export PR_NUMBER="123"
export GITHUB_REPOSITORY="myorg/myrepo"

# Run smart dismissal
node auto-unapprove.js
```

## 🧠 **How It Works**
![Action Flow](images/action-flow.png)

1. **Get all changed files** from the entire PR (not just latest commit)
2. **Parse CODEOWNERS** from the PR target branch (not default branch) resolving owners the same way codeowners-plus does (see [Owner Resolution](#owner-resolution)), expanding any `%team` organization placeholder
3. **Check team memberships** via GitHub API for relevant teams only
4. **Analyze approval timeline** - detect commits made after approval
5. **Smart dismissal logic**:
   - Dismiss code owners who authored commits
   - Dismiss stale approvals (post-approval commits to owned files)
   - Preserve legitimate approvals from non-owners

## 📝 **Example Workflow**

```yaml
name: Auto Unapprove

on:
  pull_request:
    types: [synchronize]

jobs:
  auto-unapprove:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/create-github-app-token@v1
        id: app-token
        with:
          app-id: ${{ vars.REVIEWS_APP_ID }}
          private-key: ${{ secrets.REVIEWS_APP_PRIVATE_KEY }}

      - name: Dismiss Stale Reviews
        uses: RotemK1/auto-unapprove@main
        with:
          github-token: ${{ steps.app-token.outputs.token }}
          pr-number: ${{ github.event.number }}
          dry-run: 'false'
          target-branch: ${{ github.event.pull_request.base.ref }}
          team-start-with: '@your-org/'
```

_For more workflow examples, see [`example-workflow.yml`](./example-workflow.yml)_

---

**Required Permissions:**
   for more info on how to use GitHub App token check https://github.com/actions/create-github-app-token

- **Repository permissions:**
  - Administration: Repository creation, deletion, settings, teams, and collaborators. (**READ ONLY**)
  - Contents: Repository contents, commits, branches, downloads, releases, and merges. (**READ ONLY**)
  - Pull requests: Pull requests and related comments, assignees, labels, milestones, and merges. (**READ AND WRITE**)

- **Organization permissions:**
  - Members: Organization members and teams

## ⚙️ **Key Features**

- ✅ **Target branch CODEOWNERS**: Reads ownership rules from PR target branch, not default branch
- ✅ **Stale approval detection**: Automatically detects and dismisses approvals made stale by subsequent commits
- ✅ **Surgical precision**: Only dismisses when owned files are actually modified 
- ✅ **Team support**: Full GitHub team membership validation via API
- ✅ **Organization placeholder**: Write `%team` to share one CODEOWNERS file across multiple organizations
- ✅ **Timeline analysis**: Compares approval timestamps with commit timestamps
- ✅ **codeowners-plus compatible matching**: Same glob syntax and rule precedence as codeowners-plus
- ✅ **Performance optimized**: Parallel API calls and efficient team checking
- ✅ **Comprehensive logging**: Detailed reasoning for every dismissal decision
- ✅ **Dry-run mode**: Safe testing without actual dismissals

## 📊 **Example Output**

```bash
🚀 Smart Review Dismissal
   Repository: myorg/myrepo
   PR: #123
   Mode: 🧪 DRY RUN

📁 All changed files in PR (3):
   📝 src/gui/components/Button.tsx
   📝 src/gui/styles/theme.css  
   📝 src/gui/utils/helpers.ts

🎯 Target branch: main
👑 Parsed 15 CODEOWNERS rules

🎯 DISMISSAL ANALYSIS:
   🕐 Checking commits after jane-smith's approval (2025-06-04T12:49:59.000Z)...
     📅 Commit 55a4fc5 at 2025-06-04T12:53:44Z
       🎯 Modified owned files: src/gui/components/Button.tsx
   
   🚫 DISMISS @jane-smith
      📁 Files: src/gui/components/Button.tsx, src/gui/styles/theme.css, src/gui/utils/helpers.ts
      👑 Owner Via: @myorg/frontend-team
      💡 Reason: Approval became stale - commits modified owned files
   
   ✅ KEEP @bob-jones
      📄 Not owner of changed files

📊 EXECUTION PLAN:
   • Changed files: 3
   • Total approvals: 2
   • Dismissals needed: 1
   • Approvals preserved: 1
```

## 🏢 **Organization Placeholder (`%`)**

A CODEOWNERS team reference is organization-qualified, which normally prevents
the same file from being shared across two organizations. Write a team as
`%team-name` and `%` is expanded to the organization of the repository the
action is running in. Users are still written `@user`:

```
# .codeowners - identical in every organization
*                 %platform-ci
/docs/            %docs-team @alice
```

In `swirldslabs/chewie-sandbox` that resolves to `@swirldslabs/platform-ci`; in
`PandasWhoCode/chewie-sandbox` it resolves to `@PandasWhoCode/platform-ci`.

Set `team-start-with` to `%` so the team prefix resolves the same way:

```yaml
with:
  team-start-with: "%"
```

Notes:

- Only a leading `%` followed directly by the team name is a placeholder.
  `@user`, `@org/team`, emails and any other use of `%` pass through untouched.
- **Breaking change:** the earlier `@%/team` and `%/team` forms are no longer
  expanded. Rewrite such entries as `%team`.
- `%` is not a legal character in a GitHub organization name, so there is no
  possibility of collision with a real owner.
- GitHub's own CODEOWNERS UI does not understand `%team` and will flag such
  lines as unknown owners. This matters only if you also rely on GitHub's native
  "Require review from Code Owners" branch protection.

## 📄 **`.codeowners` File**

The default ownership file is `.codeowners` at the repository root, so the same
file can be shared with [codeowners-plus](https://github.com/PandasWhoCode/codeowners-plus).
Its rule prefixes are understood:

- `&` (additional required reviewer): the owners are added to the file's
  primary owner, so their approvals are dismissed like any other owner's.
- `?` (optional reviewer): the line is skipped, because an optional reviewer is
  never a required approval.
- Inline comments (`* %team # why`) are stripped.

Only the root file named by `code-owners-file` is read; per-directory
`.codeowners` files are not.

### Owner Resolution

Owners are resolved the same way codeowners-plus resolves them for a root
`.codeowners` file:

- Paths are relative to the repository root. A leading `/` is ignored and a
  trailing `/` is treated as `/**`.
- Patterns use [doublestar](https://github.com/bmatcuk/doublestar#patterns)
  syntax: `*` and `?` never match `/`, `**` as a whole path segment matches
  zero or more directories, and `[a-z]`, `[!a-z]`, `{a,b}` and `\` escapes are
  supported.
- A file has one primary owner. Rules are tried in order of type (literal
  paths, then patterns with `*`, then patterns with `**/` or `/**`) and, within
  a type, last declared first; the first match wins. A bare `*` rule is the
  fallback used only when no other rule matches.
- Every matching `&` rule adds its owners on top of the primary owner.

For example, with

```
/platform-sdk/              %consensus %foundation
/platform-sdk/consensus-*/  %consensus
```

`platform-sdk/consensus-model/A.java` is owned only by `%consensus`.

## 🔧 **Inputs & Environment Variables**

### **GitHub Action Inputs**
| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github-token` | ✅ | - | GitHub API token with repo access |
| `team-token` | - | `github-token` | Token used only for organization team-membership lookups. Needs `read:org`. |
| `pr-number` | ✅ | - | Pull request number to analyze |
| `dry-run` | - | `true` | Set to 'false' for actual dismissals |
| `code-owners-file` | - | `.codeowners` | Path to CODEOWNERS file |
| `target-branch` | - | `main` | Target branch to read CODEOWNERS from |
| `team-start-with` | - | `@your-org/` | Team prefix for organization. Supports the `%` placeholder. |

### **Environment Variables** (Direct Script Usage)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | ✅ | - | GitHub API token with repo access |
| `PR_NUMBER` | ✅ | - | Pull request number to analyze |
| `GITHUB_REPOSITORY` | ✅ | - | Repository in owner/repo format |
| `TEAM_MEMBERS_TOKEN` | - | `GITHUB_TOKEN` | Token used only for organization team-membership lookups |
| `TEAM_START_WITH` | - | `@` | Team prefix for organization. Supports the `%` placeholder. |
| `DRY_RUN` | - | `true` | Set to 'false' for actual dismissals |
| `CODEOWNERS_FILE` | - | `.codeowners` | Path to CODEOWNERS file |
| `TARGET_BRANCH` | - | `main` | Target branch to read CODEOWNERS from |
| `CHANGED_FILES` | - | - | Newline-separated files (webhook optimization) | 

## 🧪 **Testing**

The project includes comprehensive tests for the pagination implementation:

### **Quick Test** (No API calls needed):
```bash
npm test   # or ./tests/run-tests.sh
```

These tests run automatically on every pull request and push to `main` via the
`CI Tests` workflow (`.github/workflows/ci-tests.yaml`).

### **Test with Real Data**:
```bash
export GITHUB_TOKEN='your_token'
export GITHUB_REPOSITORY='owner/repo'
export PR_NUMBER='123'
export DRY_RUN='true'
./tests/test-real-pagination.sh
```

### **Test Files**:
- `tests/test-pagination.js` - Logic tests with simulated data
- `tests/test-mock-pagination.js` - Mock API tests
- `tests/test-real-pagination.sh` - Real GitHub API tests
- `tests/TESTING.md` - Comprehensive testing guide

For detailed testing instructions, see [`tests/README.md`](tests/README.md).

## 💁🏻 Contributing

This is an open source project. Any contribution would be greatly appreciated!

## 🚩 Issues

If you have found an issue, please report it on the [issue tracker](https://github.com/RotemK1/auto-unapprove/issues)
