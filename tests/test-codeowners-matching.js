#!/usr/bin/env node

/**
 * Tests for owner resolution: doublestar glob matching and codeowners-plus
 * rule precedence.
 *
 * GITHUB_REPOSITORY must be set before requiring the module: the module
 * captures `owner` at load time.
 */

process.env.GITHUB_REPOSITORY = "hiero-ledger/hiero-consensus-node";
process.env.GITHUB_TOKEN = "test-token";
process.env.TEAM_START_WITH = "%";

const {
  parseCodeowners,
  getFileOwnersHierarchical,
  globMatches,
} = require("../auto-unapprove.js");

const { check, finish } = require("./check.js");

function owners(content, file) {
  return getFileOwnersHierarchical(file, parseCodeowners(content));
}

console.log("🧪 CODEOWNERS MATCHING TESTS");
console.log("============================");
console.log("");

console.log("1. globMatches()");
const globCases = [
  // [pattern, path, expected]
  ["README.md", "README.md", true],
  ["README.md", "docs/README.md", false],
  ["*.md", "README.md", true],
  ["*.md", "docs/README.md", false],
  ["docs/*", "docs/a.md", true],
  ["docs/*", "docs/sub/a.md", false],
  ["docs/**", "docs/sub/a.md", true],
  ["docs/**", "docs", true],
  ["docs/**", "docsx/a.md", false],
  ["**/*.js", "a.js", true],
  ["**/*.js", "a/b/c.js", true],
  ["**/models/**", "x/models/y/z.go", true],
  ["**/models/**", "x/notmodels/z.go", false],
  ["a/**/b", "a/b", true],
  ["a/**/b", "a/x/y/b", true],
  ["prefix_*/**", "prefix_one/x/y", true],
  ["prefix_*/**", "other/prefix_one/x", false],
  ["test**.txt", "test_a.txt", true],
  ["test**.txt", "test/a.txt", false],
  ["file?.txt", "file1.txt", true],
  ["file?.txt", "file/.txt", false],
  ["file[0-9].txt", "file7.txt", true],
  ["file[!0-9].txt", "file7.txt", false],
  ["file[!0-9].txt", "filex.txt", true],
  ["*.{js,ts}", "a.ts", true],
  ["*.{js,ts}", "a.go", false],
  ["a.b", "axb", false],
  ["a\\*b", "a*b", true],
  ["a\\*b", "axb", false],
  ["[abc", "a", false],
  ["{a,b", "a", false],
  ["[!]x", "ax", false],
  ["a/**/", "a", true],
  ["a/**/", "a/b", false],
  [
    "platform-sdk/consensus-*/**",
    "platform-sdk/consensus-model/src/main/java/A.java",
    true,
  ],
  [
    "platform-sdk/consensus-*/**",
    "platform-sdk/swirlds-common/src/main/java/A.java",
    false,
  ],
];
for (const [pattern, path, expected] of globCases) {
  check(
    `${JSON.stringify(pattern)} ${expected ? "matches" : "does not match"} ${JSON.stringify(path)}`,
    globMatches(pattern, path),
    expected,
  );
}
console.log("");

console.log("2. getFileOwnersHierarchical() precedence");

// Regression for hiero-ledger/hiero-consensus-node#27426: the wildcard
// directory rule must win over its broader parent rule.
const hiero = [
  "*                           %github-maintainers",
  "/platform-sdk/              %consensus-codeowners %foundation-codeowners",
  "/platform-sdk/consensus-*/  %consensus-codeowners",
  "/platform-sdk/swirlds-*/    %foundation-codeowners",
].join("\n");
check(
  "wildcard directory rule beats its parent directory rule",
  owners(
    hiero,
    "platform-sdk/consensus-model/src/main/java/org/hiero/consensus/model/event/EventHashFactory.java",
  ),
  ["@hiero-ledger/consensus-codeowners"],
);
check(
  "parent directory rule still applies to unmatched children",
  owners(hiero, "platform-sdk/build.gradle.kts"),
  ["@hiero-ledger/consensus-codeowners", "@hiero-ledger/foundation-codeowners"],
);
check("* is only a fallback", owners(hiero, "README.md"), [
  "@hiero-ledger/github-maintainers",
]);
check(
  "* is not consulted when another rule matches",
  owners(hiero, "platform-sdk/swirlds-base/A.java"),
  ["@hiero-ledger/foundation-codeowners"],
);

check(
  "last declared rule wins within the same rule type",
  owners(["docs/  @first", "docs/  @second"].join("\n"), "docs/a.md"),
  ["@second"],
);
check(
  "a longer earlier pattern does not beat a later one of the same type",
  owners(
    ["src/main/**  @long", "src/**  @short"].join("\n"),
    "src/main/A.java",
  ),
  ["@short"],
);
check(
  "a literal file rule beats a later wildcard rule",
  owners(
    ["src/A.java  @literal", "src/*.java  @wildcard"].join("\n"),
    "src/A.java",
  ),
  ["@literal"],
);
check(
  "a wildcard rule beats a later globstar rule",
  owners(
    ["src/*.java  @wildcard", "**/*.java  @globstar"].join("\n"),
    "src/A.java",
  ),
  ["@wildcard"],
);
check(
  "the last * fallback wins",
  owners(["*  @first", "*  @second"].join("\n"), "a.txt"),
  ["@second"],
);
check(
  "a file matched by nothing has no owners",
  owners("docs/  @docs", "src/A.java"),
  [],
);
console.log("");

console.log("3. getFileOwnersHierarchical() & rules");
check(
  "& rules add to the primary owner instead of replacing it",
  owners(
    ["src/  @primary", "& src/security/**  @security"].join("\n"),
    "src/security/Auth.java",
  ),
  ["@primary", "@security"],
);
check(
  "every matching & rule applies",
  owners(
    ["*  @fallback", "& **/*.gradle.kts  @build", "&src/**  @src"].join("\n"),
    "src/build.gradle.kts",
  ),
  ["@fallback", "@build", "@src"],
);
check(
  "& * applies to every file and is not a fallback",
  owners(["src/  @primary", "& *  @auditor"].join("\n"), "src/a/b.txt"),
  ["@primary", "@auditor"],
);
check(
  "non-matching & rules are ignored",
  owners(["src/  @primary", "& docs/**  @docs"].join("\n"), "src/a.txt"),
  ["@primary"],
);
check(
  "owners are de-duplicated",
  owners(["src/  @primary", "& src/**  @primary"].join("\n"), "src/a.txt"),
  ["@primary"],
);
console.log("");

finish("✅ All CODEOWNERS matching tests passed!");
