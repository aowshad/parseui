## Git workflow for this repo (always follow)

Never commit directly to main. For every change I ask for:

1. Update main first: `git checkout main && git pull`.
2. Create a branch named for the change, e.g. `fix/icon-centering` or `feat/icon-grid`.
3. Make the change. Commit in small, logical commits with clear messages. Every commit message ends with a blank line and then exactly one line: `Co-Authored-By: Claude <noreply@anthropic.com>`
4. Push and open a PR with a written title and description:
   `gh pr create --base main --title "<short title>" --body "<description>"`
   The description covers what changed, why, and how to test it. Add before/after notes for visual changes.
5. STOP and show me the PR link. Wait for me to reply "merge".
6. When I say merge:
   `gh pr merge --merge --delete-branch`
   then `git checkout main && git pull`.
7. If the repo deploys with GitHub Pages, wait until `gh api repos/{owner}/{repo}/pages/builds/latest --jq .status` says "built". Then confirm the live site returns HTTP 200.

Never force-push. Never merge without my "merge". One PR per change I request. Don't split a change into several PRs just to increase the count.
