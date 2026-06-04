#!/usr/bin/env node
import { checkPrBody } from "./pr-body-autoclose-guard.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const unsafeNegated = checkPrBody(
    "This PR does not close #179 or prove learning outcomes.",
  );
  assert(unsafeNegated.status === "fail", "negated close keyword should still fail");
  assert(unsafeNegated.violations[0]?.issue === 179, "unsafe phrase should identify #179");

  const unsafeKeyword = checkPrBody("Closes #179 after fixture mechanics.");
  assert(unsafeKeyword.status === "fail", "direct close keyword should fail");

  const safeProtectedReference = checkPrBody(
    "This PR does not complete issue #179 or prove learning outcomes.",
  );
  assert(safeProtectedReference.status === "pass", "safe protected reference should pass");

  const safeCurrentIssueClose = checkPrBody("Closes #234. This does not complete issue #179.");
  assert(safeCurrentIssueClose.status === "pass", "closing an unprotected implementation issue should pass");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-24",
        checked: [
          "unsafe negated close keyword",
          "unsafe direct close keyword",
          "safe protected issue reference",
          "safe current issue close",
        ],
        claimBoundary:
          "This validates PR body wording guardrails only. It does not inspect GitHub merge state.",
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-24", error: error.message }, null, 2));
  process.exitCode = 1;
}
