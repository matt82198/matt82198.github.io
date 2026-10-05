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

New fields (computed at refresh time):
  - merged_prs: GitHub Search API count if GITHUB_TOKEN is set, else git-log merge count
  - commits: Total commits on main (git rev-list --count)
  - releases: Count of tags matching v*
  - incidents: Number of entries in docs/INCIDENTS.md
  - first_commit_date: ISO date of first commit
  - days_active: Days from first commit to today
  - refreshed_at: ISO-8601 UTC timestamp of this run
  - merged_prs_source: Either "github-api" or "git-log"

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
import re
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
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

    # Not found (e.g. the Pages CI runner, which has no aesop checkout)
    if os.environ.get("CI"):
        print("sync-aesop-stats: aesop repo not found in CI environment - FAILING", file=sys.stderr)
        sys.exit(1)

    # Not CI: return None so main() skips the refresh and keeps the committed src/data/aesop-stats.json
    return None


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


def compute_iteration_cycles(aesop_repo: Path) -> int:
    """Compute max wave/iteration number from git log.

    Scans all commit messages for wave-N or wave_N patterns and returns the
    maximum N found, representing the highest iteration cycle reached.
    Falls back to 0 if no waves found.
    """
    try:
        result = subprocess.run(
            ["git", "log", "--format=%B"],
            cwd=str(aesop_repo),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        output = result.stdout or ""

        waves = set()
        for match in re.finditer(r"wave[_-]?(\d+)", output, re.IGNORECASE):
            waves.add(int(match.group(1)))

        return max(waves) if waves else 0
    except Exception:
        return 0


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


def count_releases(aesop_repo: Path) -> int:
    """Count tags matching v* (releases)."""
    result = subprocess.run(
        ["git", "tag", "-l", "v*"],
        cwd=str(aesop_repo),
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    )
    tags = [line.strip() for line in (result.stdout or "").splitlines() if line.strip()]
    return len(tags)


def count_incidents(aesop_repo: Path) -> int:
    """Count incident entries in docs/INCIDENTS.md.

    Counts table rows (excluding header and separator rows).
    Scans for lines starting with pipe that are not the header or separator.
    """
    incidents_file = aesop_repo / "docs" / "INCIDENTS.md"
    if not incidents_file.exists():
        return 0

    try:
        content = incidents_file.read_text(encoding="utf-8")

        # Find all lines starting with pipe
        all_pipe_lines = re.findall(r"^\|", content, re.MULTILINE)

        # Count them and subtract 2 for header and separator rows
        # Header: | Class | What Happened | Resolution | Source |
        # Separator: | --- | --- | --- | --- |
        total_pipe_lines = len(all_pipe_lines)
        if total_pipe_lines >= 2:
            return total_pipe_lines - 2
        return 0
    except Exception:
        return 0


def get_first_commit_date(aesop_repo: Path) -> tuple[str, int]:
    """Get the ISO date of the first commit and days active.

    Returns (iso_date, days_active).
    """
    try:
        result = subprocess.run(
            ["git", "log", "--format=%aI", "--reverse"],
            cwd=str(aesop_repo),
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        lines = [line.strip() for line in (result.stdout or "").splitlines() if line.strip()]
        if not lines:
            return "", 0

        first_commit_iso = lines[0]
        # Parse ISO date to get just the date part (YYYY-MM-DD)
        first_commit_date = first_commit_iso.split("T")[0]

        # Calculate days active
        first_dt = datetime.fromisoformat(first_commit_iso)
        now_utc = datetime.now(timezone.utc)
        days_active = (now_utc - first_dt).days

        return first_commit_date, days_active
    except Exception:
        return "", 0


def count_total_commits(aesop_repo: Path) -> int:
    """Count total commits on main.

    Uses origin/main if it exists, otherwise HEAD.
    """
    try:
        # Try origin/main first
        result = subprocess.run(
            ["git", "rev-list", "--count", "origin/main"],
            cwd=str(aesop_repo),
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        if result.returncode == 0:
            count_str = (result.stdout or "").strip()
            if count_str.isdigit():
                return int(count_str)

        # Fall back to HEAD
        result = subprocess.run(
            ["git", "rev-list", "--count", "HEAD"],
            cwd=str(aesop_repo),
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        if result.returncode == 0:
            count_str = (result.stdout or "").strip()
            if count_str.isdigit():
                return int(count_str)

        return 0
    except Exception:
        return 0


def count_merged_prs_via_api(timeout_sec: int = 10) -> tuple[int, str]:
    """Count merged PRs via GitHub Search API if GITHUB_TOKEN is set.

    Returns (count, "github-api") on success, or (None, "git-log") on failure/no token.
    """
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        return None, "git-log"

    try:
        query = "repo:matt82198/aesop is:pr is:merged"
        url = f"https://api.github.com/search/issues?q={urllib.parse.quote(query)}&per_page=1"

        req = urllib.request.Request(url)
        req.add_header("Authorization", f"token {token}")
        req.add_header("Accept", "application/vnd.github.v3+json")

        with urllib.request.urlopen(req, timeout=timeout_sec) as response:
            data = json.loads(response.read().decode("utf-8"))
            if "total_count" in data:
                return data["total_count"], "github-api"
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, Exception) as e:
        print(f"GitHub API call failed: {e} - falling back to git-log", file=sys.stderr)

    return None, "git-log"


def main() -> None:
    aesop_repo = resolve_aesop_repo()
    if aesop_repo is None:
        print(
            "sync-aesop-stats: aesop repo not present (e.g. CI) - skipping refresh, "
            "using the committed src/data/aesop-stats.json.",
            file=sys.stderr,
        )
        return

    # PRIORITY: Read the committed snapshot as source of truth (portfolio numbers == README == stats.json)
    # This ensures the portfolio syncs with aesop's own committed snapshot, not its live git state
    aesop_stats_file = aesop_repo / "stats.json"
    stats = {}
    fallback_to_git = False

    if aesop_stats_file.exists():
        try:
            committed_stats = json.loads(aesop_stats_file.read_text(encoding="utf-8"))
            # Map the committed snapshot's nested structure to portfolio flat keys
            # aesop stats.json structure: { git: { merged_prs, total_commits, distinct_coauthors, wave_count }, loc, ... }
            git_stats = committed_stats.get("git", {})
            if git_stats:
                # Map aesop's git structure to portfolio's flat structure
                if "merged_prs" in git_stats:
                    stats["merged_prs"] = git_stats["merged_prs"]
                if "total_commits" in git_stats:
                    stats["commits"] = git_stats["total_commits"]
                if "distinct_coauthors" in git_stats:
                    stats["coauthors"] = git_stats["distinct_coauthors"]
                if "wave_count" in git_stats:
                    stats["waves"] = git_stats["wave_count"]
                # Classified author stats (new fields)
                if "authors_human" in git_stats:
                    stats["authors_human"] = git_stats["authors_human"]
                if "model_tiers" in git_stats:
                    stats["model_tiers"] = git_stats["model_tiers"]
                if "model_tier_names" in git_stats:
                    stats["model_tier_names"] = git_stats["model_tier_names"]
            # Top-level fields
            if "loc" in committed_stats:
                stats["loc"] = committed_stats["loc"]
            print(f"aesop stats source: {aesop_stats_file} (committed snapshot)")
        except (json.JSONDecodeError, IOError):
            fallback_to_git = True
            print(f"Failed to read committed stats.json, falling back to live git computation", file=sys.stderr)
    else:
        fallback_to_git = True
        print(f"Committed stats.json not found at {aesop_stats_file}, falling back to live git computation", file=sys.stderr)

    # Fallback: compute live from git if stats.json is missing or unreadable
    if fallback_to_git:
        git = load_git_stats(aesop_repo)
        iteration_cycles = compute_iteration_cycles(aesop_repo)
        shipped_increments = git.merged_prs

        stats = {
            "commits": git.total_commits,
            "merged_prs": git.merged_prs,
            "coauthors": git.distinct_coauthors,
            "domains": count_domains(aesop_repo),
            "test_files": count_test_files(aesop_repo),
            "loc": git.lines_of_code,
            "version": read_version(aesop_repo),
            "shipped_increments": shipped_increments,
        }

        # Include waves and iteration_cycles only if they exist
        if hasattr(git, 'wave_count') and git.wave_count is not None:
            stats["waves"] = git.wave_count
        if iteration_cycles > 0:
            stats["iteration_cycles"] = iteration_cycles
    else:
        # Compute only the domain/test/shipped metrics that aren't in the committed snapshot
        stats["domains"] = count_domains(aesop_repo)
        stats["test_files"] = count_test_files(aesop_repo)
        # Always include version (derives from aesop package.json)
        stats["version"] = read_version(aesop_repo)
        # shipped_increments should be in the snapshot as merged_prs, but add it for rendering
        if "merged_prs" in stats:
            stats["shipped_increments"] = stats["merged_prs"]

    # Compute new fields (always, from the aesop checkout)
    try:
        import urllib.parse
    except ImportError:
        from urllib import parse as urllib_parse
        urllib.parse = urllib_parse

    # GitHub API for merged PRs (if token available)
    merged_prs_api, merged_prs_source = count_merged_prs_via_api()
    if merged_prs_api is not None:
        stats["merged_prs"] = merged_prs_api
        stats["merged_prs_source"] = "github-api"
    else:
        # Keep existing merged_prs from snapshot or fallback
        if "merged_prs" not in stats:
            # Compute from git log merge commits
            git = load_git_stats(aesop_repo) if not fallback_to_git else git
            stats["merged_prs"] = git.merged_prs
        stats["merged_prs_source"] = "git-log"

    # Total commits on main
    total_commits = count_total_commits(aesop_repo)
    if total_commits > 0:
        stats["commits"] = total_commits

    # Releases
    releases = count_releases(aesop_repo)
    stats["releases"] = releases

    # Incidents
    incidents = count_incidents(aesop_repo)
    stats["incidents"] = incidents

    # First commit date and days active
    first_commit_date, days_active = get_first_commit_date(aesop_repo)
    if first_commit_date:
        stats["first_commit_date"] = first_commit_date
        stats["days_active"] = days_active

    # Refreshed timestamp (ISO-8601 UTC)
    now_utc = datetime.now(timezone.utc)
    stats["refreshed_at"] = now_utc.isoformat(timespec="seconds").replace("+00:00", "Z")

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
        print(f"  {key:20} {new_val}{arrow}")


if __name__ == "__main__":
    main()
