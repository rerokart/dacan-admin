#!/usr/bin/env bash
# Deploy dacan-admin to Vercel from the CLI, for this project only.
#
# Why a copy: the Vercel CLI reads the local git history and sends the commit
# author to Vercel. On the Hobby plan a commit author who isn't the account
# owner gets blocked (TEAM_ACCESS_REQUIRED). So we export the committed HEAD
# into a temp folder with no .git and deploy that. Uncommitted edits are never
# deployed.
#
# Usage: scripts/vercel-deploy.sh [preview|prod]
set -euo pipefail

VERCEL_VERSION="65.16.0"
mode="${1:-preview}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

# Read the linked project (pnpm vc:link writes repo.json or project.json) and
# pin the deploy to it. Only this one project can be deployed by this script.
ids="$(node -e '
  const fs = require("fs");
  let p;
  if (fs.existsSync(".vercel/project.json")) {
    const j = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
    p = { id: j.projectId, orgId: j.orgId };
  } else if (fs.existsSync(".vercel/repo.json")) {
    const j = JSON.parse(fs.readFileSync(".vercel/repo.json", "utf8"));
    p = (j.projects || []).find((x) => x.directory === ".");
  }
  if (!p || !p.id || !p.orgId) process.exit(1);
  console.log(p.orgId + " " + p.id);
')" || { echo "Not linked yet. Run: pnpm vc:link" >&2; exit 1; }
export VERCEL_ORG_ID="${ids% *}"
export VERCEL_PROJECT_ID="${ids#* }"

sha="$(git rev-parse --short HEAD)"
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ -n "$(git status --porcelain)" ]; then
  echo "Note: you have uncommitted changes. They are NOT deployed; deploying commit $sha ($branch)."
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git archive HEAD | tar -x -C "$tmp"

args=(deploy --meta "commit=$sha" --meta "branch=$branch")
if [ "$mode" = "prod" ]; then
  args+=(--prod)
elif [ "$mode" != "preview" ]; then
  echo "Usage: scripts/vercel-deploy.sh [preview|prod]" >&2
  exit 1
fi

echo "Deploying $sha ($branch) as $mode..."
cd "$tmp"
pnpm dlx "vercel@$VERCEL_VERSION" --global-config "$root/.vercel-cli" "${args[@]}"
