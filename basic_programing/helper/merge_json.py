#!/usr/bin/env python3
"""
JSON Merger Utility
Merges multiple partial JSON files into one complete problems_output.json file.
Useful if generation was interrupted or you have multiple partial results.
"""

import json
import sys
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

def load_json_file(filepath: str) -> Optional[Dict[str, Any]]:
    """Load a JSON file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in {filepath}: {e}")
        return None

def merge_json_files(filepaths: List[str], output_file: str = "problems_output_merged.json"):
    """Merge multiple JSON files into one."""
    print("="*70)
    print("JSON Merger Utility")
    print("="*70)
    
    all_problems = []
    seen_ids = set()
    duplicates = []
    
    # Load all files
    for filepath in filepaths:
        print(f"\nLoading: {filepath}")
        data = load_json_file(filepath)
        
        if data is None:
            continue
        
        # Handle different file structures
        problems = []
        if isinstance(data, dict):
            if "problems" in data:
                problems = data["problems"]
            elif "id" in data:  # Single problem object
                problems = [data]
        elif isinstance(data, list):
            problems = data
        
        if not problems:
            print(f"  WARNING: No problems found in {filepath}")
            continue
        
        print(f"  Found {len(problems)} problem(s)")
        
        # Add problems, checking for duplicates
        for problem in problems:
            problem_id = problem.get("id", "UNKNOWN")
            if problem_id in seen_ids:
                duplicates.append(problem_id)
                print(f"  ⚠ Duplicate ID found: {problem_id} (skipping)")
            else:
                seen_ids.add(problem_id)
                all_problems.append(problem)
    
    if not all_problems:
        print("\nERROR: No problems to merge!")
        return False
    
    # Sort by ID
    all_problems.sort(key=lambda x: x.get("id", ""))
    
    # Create output structure
    output = {
        "metadata": {
            "total_problems": len(all_problems),
            "successful_generations": len(all_problems),
            "generated_date": datetime.utcnow().isoformat() + "Z",
            "model_used": "gemini-3-pro-preview",
            "language": "csharp",
            "course": "PSUP - Programming and Software Using Programming",
            "merged_from": filepaths,
            "duplicates_found": len(duplicates)
        },
        "problems": all_problems
    }
    
    # Save merged file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*70)
    print("MERGE SUMMARY")
    print("="*70)
    print(f"Input Files:       {len(filepaths)}")
    print(f"Total Problems:    {len(all_problems)}")
    print(f"Duplicates:        {len(duplicates)}")
    print(f"Output File:       {output_file}")
    
    if duplicates:
        print("\nDuplicate IDs (not included in output):")
        for dup_id in duplicates:
            print(f"  - {dup_id}")
    
    print(f"\n✅ Successfully merged {len(all_problems)} problems into {output_file}")
    return True

def find_json_files(directory: str = ".") -> List[str]:
    """Find all JSON files in a directory."""
    json_files = []
    for file in os.listdir(directory):
        if file.endswith(".json") and file != "problems_output.json":
            json_files.append(os.path.join(directory, file))
    return json_files

def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("JSON Merger Utility")
        print("="*70)
        print("\nUsage:")
        print("  python merge_json.py <file1.json> <file2.json> [file3.json ...]")
        print("  python merge_json.py --auto  (auto-detect JSON files in current directory)")
        print("\nExamples:")
        print("  python merge_json.py batch1.json batch2.json")
        print("  python merge_json.py problems_*.json")
        print("  python merge_json.py --auto")
        sys.exit(1)
    
    # Auto-detect mode
    if sys.argv[1] == "--auto":
        print("Auto-detecting JSON files...")
        filepaths = find_json_files()
        if not filepaths:
            print("ERROR: No JSON files found in current directory")
            sys.exit(1)
        print(f"Found {len(filepaths)} JSON file(s):")
        for fp in filepaths:
            print(f"  - {fp}")
        print()
    else:
        filepaths = sys.argv[1:]
    
    # Optional: specify output file
    output_file = "problems_output_merged.json"
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_file = sys.argv[idx + 1]
            filepaths.remove("--output")
            filepaths.remove(output_file)
    
    success = merge_json_files(filepaths, output_file)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
