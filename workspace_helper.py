#!/usr/bin/env python3
"""
Workspace Helper CLI for DayZero
Consolidates all one-off code dump, extraction, search, and cleanup tools.
"""

import os
import re
import sys
import argparse
from typing import List, Optional

# List of file prefixes and extensions commonly used by temporary/scratch files in this workspace
TEMP_FILE_PATTERNS = [
    r"^dump_.*\.py$",
    r"^temp_.*\.txt$",
    r"^fix_.*\.py$",
    r"^update_.*\.py$",
    r"^find_html.*\.py$",
    r"^activate_.*\.py$",
    r"^add_.*\.py$",
    r"^get_.*\.py$",
    r"^unclutter_.*\.py$",
    r"^refine_.*\.py$",
    r"^inject_.*\.py$",
    r"^move_.*\.py$",
    r"^webrtc_impl.*\.py$",
    r"^test_.*\.py$",
    r"^test\.py$"
]

def search_in_file(filepath: str, query: str, is_regex: bool = False) -> List[dict]:
    """Search for a string or regex pattern in a file, returning match positions and lines."""
    results = []
    if not os.path.exists(filepath):
        print(f"Error: File '{filepath}' does not exist.")
        return results

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file '{filepath}': {e}")
        return results

    if is_regex:
        matches = re.finditer(query, content, flags=re.DOTALL | re.IGNORECASE)
        for match in matches:
            start, end = match.span()
            # Find line number
            line_no = content[:start].count('\n') + 1
            results.append({
                'start': start,
                'end': end,
                'line': line_no,
                'match_text': match.group(0)
            })
    else:
        start = 0
        while True:
            idx = content.find(query, start)
            if idx == -1:
                break
            line_no = content[:idx].count('\n') + 1
            results.append({
                'start': idx,
                'end': idx + len(query),
                'line': line_no,
                'match_text': query
            })
            start = idx + len(query)

    return results

def extract_block(
    filepath: str,
    query: str,
    is_regex: bool = False,
    before: int = 500,
    after: int = 2500,
    output_file: Optional[str] = None
) -> None:
    """Extract code around a match and display it or save it to a file."""
    if not os.path.exists(filepath):
        print(f"Error: File '{filepath}' does not exist.")
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file '{filepath}': {e}")
        return

    results = search_in_file(filepath, query, is_regex)
    if not results:
        print(f"No matches found for query: '{query}' in {filepath}")
        return

    # Use the first match
    match = results[0]
    start_idx = max(0, match['start'] - before)
    end_idx = min(len(content), match['end'] + after)
    
    extracted = content[start_idx:end_idx]
    
    print(f"\n[INFO] Found match on line {match['line']}. Extracted {len(extracted)} chars (chars {start_idx} to {end_idx}).")
    
    if output_file:
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(extracted)
            print(f"[SUCCESS] Extracted block successfully saved to '{output_file}'")
        except Exception as e:
            print(f"Error writing to output file '{output_file}': {e}")
    else:
        print("-" * 80)
        print(extracted)
        print("-" * 80)

def get_cleanup_candidates() -> List[str]:
    """Find all files in the current directory matching the temporary/scratch pattern."""
    candidates = []
    current_dir = os.getcwd()
    
    # Exclude files that are known core workspace files
    core_files = {
        "app.py", "app.js", "dashboard.html", "dashboard.css", "dashboard.js",
        "index.html", "main.css", "orchestrator.py", "workspace_helper.py"
    }

    compiled_patterns = [re.compile(p, re.IGNORECASE) for p in TEMP_FILE_PATTERNS]

    for filename in os.listdir(current_dir):
        if not os.path.isfile(filename):
            continue
        if filename in core_files:
            continue
        
        # Check if the filename matches any of our patterns
        for pattern in compiled_patterns:
            if pattern.match(filename):
                candidates.append(filename)
                break
                
    return sorted(candidates)

def perform_cleanup(dry_run: bool = True) -> None:
    """Scan and clean up temporary/scratch files."""
    candidates = get_cleanup_candidates()
    
    if not candidates:
        print("[INFO] No temporary or scratch files found. Your workspace is already perfectly clean!")
        return

    print(f"\nFound {len(candidates)} temporary/scratch files:")
    for f in candidates:
        size = os.path.getsize(f)
        print(f"  - {f} ({size} bytes)")

    if dry_run:
        print("\n[DRY RUN] No files were deleted. Run with '--force' to delete these files.")
        return

    print("\nDeleting files...")
    deleted_count = 0
    for f in candidates:
        try:
            os.remove(f)
            deleted_count += 1
        except Exception as e:
            print(f"  Error deleting '{f}': {e}")
            
    print(f"[SUCCESS] Cleaned up {deleted_count} temporary files successfully!")

def main():
    parser = argparse.ArgumentParser(
        description="Workspace Helper CLI - Consolidate code dumping, search, and cleanup.",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Subcommand: extract
    extract_parser = subparsers.add_parser("extract", help="Extract code around a keyword/pattern")
    extract_parser.add_argument("-f", "--file", default="dashboard.js", help="File to extract from (default: dashboard.js)")
    extract_parser.add_argument("-q", "--query", required=True, help="Search keyword or regex pattern")
    extract_parser.add_argument("-r", "--regex", action="store_true", help="Treat query as regular expression")
    extract_parser.add_argument("-b", "--before", type=int, default=500, help="Characters to extract BEFORE the match start")
    extract_parser.add_argument("-a", "--after", type=int, default=2500, help="Characters to extract AFTER the match end")
    extract_parser.add_argument("-o", "--output", help="Optional output text file to save the block")

    # Subcommand: search
    search_parser = subparsers.add_parser("search", help="Search for string or pattern in a file")
    search_parser.add_argument("-f", "--file", default="dashboard.js", help="File to search in")
    search_parser.add_argument("-q", "--query", required=True, help="String or regex pattern to find")
    search_parser.add_argument("-r", "--regex", action="store_true", help="Treat query as regular expression")

    # Subcommand: cleanup
    cleanup_parser = subparsers.add_parser("cleanup", help="Clean up redundant one-off scripts and text files")
    cleanup_parser.add_argument("--force", action="store_true", help="Actually delete the files (omitting this does a dry run)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "extract":
        extract_block(args.file, args.query, args.regex, args.before, args.after, args.output)
    elif args.command == "search":
        results = search_in_file(args.file, args.query, args.regex)
        if not results:
            print(f"No matches found for query: '{args.query}' in {args.file}")
        else:
            print(f"\nFound {len(results)} matches in '{args.file}':")
            for r in results:
                snippet = r['match_text'].replace('\n', ' ')[:60]
                print(f"  Line {r['line']} (idx {r['start']}-{r['end']}): \"{snippet}...\"")
    elif args.command == "cleanup":
        perform_cleanup(dry_run=not args.force)

if __name__ == "__main__":
    main()
