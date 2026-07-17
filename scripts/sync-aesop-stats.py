#!/usr/bin/env python3
"""Sync src/data/aesop-stats.json from the authoritative aesop repo.

The portfolio shows live stats about the aesop project. Those numbers used to be
hand-maintained and drifted out of date as aesop advanced. This script re-derives
every number from the aesop git repo so a refresh is one command, never a hand-edit.

Ground truth: aesop's own tools/self_stats.py (git-derived, verifiable by anyone who
clones -- NOT the GitHub contributors API). We import its GitStats class so the git
metrics (commits, merged PRs, waves, LOC) come from the exact same authoritative logic,
computed in a single snapshot. Fields self_stats doesn't emit are derived here from the
aesop working tree: domains (subdirectories carrying a CLAUDE.md), test_files (test file
count), and version (aesop package.json), matching the schema in src/data/aesop-stats.json.

Usage:
    python scripts/sync-aesop-stats.py [AESOP_REPO_PATH]

The aesop repo path is resolved in this order:
    1. the CLI argument, if given
    2. the AESOP_REPO environment variable
    3. ../aesop (sibling of the portfolio repo)
    4. ~/aesop

Then run `npm run build` to bake the refreshed numbers into dist/.
Equivalent npm alias: `npm run sync:stats`.
"""

import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

# --- locate the portfolio's data file relative to this script ---------------
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DATA_FILE = REPO_ROOT / "src" / "data" / "aesop-stats.json"


def resolve_aesop_repo() -> Path:
    """Find the aesop repo: CLI arg > $AESOP_REPO > ../aesop > ~/aesop."""
    candidates = []
    if len(sys.argv) > 1:
        candidates.append(Path(sys.argv[1]).expanduser())
    if os.environ.get("AESOP_REPO"):
        candidates.append(Path(os.environ["AESOP_REPO"]).expanduser())
    candidates.append(REPO_ROOT.parent / "aesop")
    candidates.append(Path.home() / "aesop")

    for cand in candidates:
        if (cand / "tools" / "self_stats.py").is_file():
            return cand.resolve()

    tried = "\n  ".join(str(c) for c in candidates)
    sys.exit(
        "ERROR: could not find the aesop repo (needs tools/self_stats.py).\n"
        "Pass the path as an argument or set AESOP_REPO.\n"
        f"Tried:\n  {tried}"
    )


def load_git_stats(aesop_repo: Path):
    """Import aesop's GitStats class and instantiate it against the aesop repo."""
    self_stats_path = aesop_repo / "tools" / "self_stats.py"
    spec = importlib.util.spec_from_file_location("aesop_self_stats", self_stats_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.GitStats(repo_root=str(aesop_repo))


def git_ls_files(aesop_repo: Path, *patterns) -> list[str]:
    """List tracked files in the aesop repo matching the given pathspecs."""
    result = subprocess.run(
        ["git", "ls-files", *patterns],
        cwd=str(aesop_repo),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    return [line.strip() for line in (result.stdout or "").splitlines() if line.strip()]


def count_domains(aesop_repo: Path) -> int:
    """Domains = subdirectories carrying a CLAUDE.md (root CLAUDE.md excluded)."""
    claude_files = git_ls_files(aesop_repo, "*CLAUDE.md", "CLAUDE.md")
    return sum(1 for f in claude_files if "/" in f)


def count_test_files(aesop_repo: Path) -> int:
    """Test files = tests/test_*.py + *.test.mjs + *.test.sh (tracked)."""
    files = git_ls_files(aesop_repo, "tests/test_*.py", "*.test.mjs", "*.test.sh")
    return len(files)


def read_version(aesop_repo: Path) -> str:
    """Read aesop package.json version, normalised to a leading 'v' (schema convention)."""
    pkg = json.loads((aesop_repo / "package.json").read_text(encoding="utf-8"))
    version = str(pkg.get("version", "")).strip()
    if version and not version.startswith("v"):
        version = "v" + version
    return version


def main() -> None:
    aesop_repo = resolve_aesop_repo()
    git = load_git_stats(aesop_repo)

    stats = {
        "commits": git.total_commits,
        "merged_prs": git.merged_prs,
        "waves": git.wave_count,
        "domains": count_domains(aesop_repo),
        "test_files": count_test_files(aesop_repo),
        "loc": git.lines_of_code,
        "version": read_version(aesop_repo),
    }

    # Show a before -> after diff so the refresh is auditable.
    old = {}
    if DATA_FILE.exists():
        try:
            old = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            old = {}

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")

    print(f"aesop repo: {aesop_repo}")
    print(f"wrote:      {DATA_FILE}")
    for key, new_val in stats.items():
        old_val = old.get(key, "-")
        arrow = "" if str(old_val) == str(new_val) else f"  (was {old_val})"
        print(f"  {key:12} {new_val}{arrow}")


if __name__ == "__main__":
    main()
