#!/usr/bin/env python3
"""
JSON Validator for AI-Generated Problem Data
Validates the structure and completeness of the problems_output.json file.
"""

import json
import sys
import re
from typing import Dict, List, Any, Tuple

class ProblemValidator:
    """Validates individual problem entries."""
    
    REQUIRED_FIELDS = {
        "id": str,
        "title": str,
        "description": str,
        "difficulty": int,
        "reference": dict,
        "hint": str,
        "algorithm": dict,
        "solution": dict
    }
    
    REFERENCE_FIELDS = {
        "part": str,
        "slide": (str, int),  # Can be string or int
        "page": int
    }
    
    ALGORITHM_FIELDS = {
        "description": str,
        "steps": list
    }
    
    SOLUTION_FIELDS = {
        "language": str,
        "code": str,
        "explanation": str,
        "time_complexity": str,
        "space_complexity": str
    }
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate_problem(self, problem: Dict[str, Any], index: int) -> Tuple[bool, List[str], List[str]]:
        """Validate a single problem entry."""
        self.errors = []
        self.warnings = []
        problem_id = problem.get("id", f"Problem #{index+1}")
        
        # Check all required top-level fields
        for field, expected_type in self.REQUIRED_FIELDS.items():
            if field not in problem:
                self.errors.append(f"Missing required field: '{field}'")
            elif not isinstance(problem[field], expected_type):
                self.errors.append(f"Field '{field}' has wrong type. Expected {expected_type.__name__}, got {type(problem[field]).__name__}")
        
        # Validate ID format
        if "id" in problem:
            if not re.match(r'^PROB_\d{3}$', problem["id"]):
                self.errors.append(f"Invalid ID format: '{problem['id']}'. Expected format: PROB_XXX (e.g., PROB_001)")
        
        # Validate title
        if "title" in problem and not problem["title"].strip():
            self.errors.append("Title cannot be empty")
        
        # Validate description
        if "description" in problem:
            if not problem["description"].strip():
                self.errors.append("Description cannot be empty")
            elif len(problem["description"]) < 20:
                self.warnings.append("Description seems too short (< 20 characters)")
        
        # Validate difficulty
        if "difficulty" in problem:
            if not (1 <= problem["difficulty"] <= 10):
                self.errors.append(f"Difficulty must be between 1 and 10, got {problem['difficulty']}")
        
        # Validate reference structure
        if "reference" in problem and isinstance(problem["reference"], dict):
            for field, expected_type in self.REFERENCE_FIELDS.items():
                if field not in problem["reference"]:
                    self.errors.append(f"Missing field in reference: '{field}'")
                else:
                    value = problem["reference"][field]
                    if isinstance(expected_type, tuple):
                        if not isinstance(value, expected_type):
                            self.errors.append(f"Reference field '{field}' has wrong type")
                    elif not isinstance(value, expected_type):
                        self.errors.append(f"Reference field '{field}' has wrong type. Expected {expected_type.__name__}")
        
        # Validate hint
        if "hint" in problem:
            if not problem["hint"].strip():
                self.errors.append("Hint cannot be empty")
            elif len(problem["hint"]) < 10:
                self.warnings.append("Hint seems too short (< 10 characters)")
        
        # Validate algorithm structure
        if "algorithm" in problem and isinstance(problem["algorithm"], dict):
            for field, expected_type in self.ALGORITHM_FIELDS.items():
                if field not in problem["algorithm"]:
                    self.errors.append(f"Missing field in algorithm: '{field}'")
                elif not isinstance(problem["algorithm"][field], expected_type):
                    self.errors.append(f"Algorithm field '{field}' has wrong type. Expected {expected_type.__name__}")
            
            # Validate steps array
            if "steps" in problem["algorithm"]:
                if not problem["algorithm"]["steps"]:
                    self.errors.append("Algorithm steps array is empty")
                elif not all(isinstance(step, str) for step in problem["algorithm"]["steps"]):
                    self.errors.append("All algorithm steps must be strings")
                elif len(problem["algorithm"]["steps"]) < 2:
                    self.warnings.append("Algorithm has fewer than 2 steps")
        
        # Validate solution structure
        if "solution" in problem and isinstance(problem["solution"], dict):
            for field, expected_type in self.SOLUTION_FIELDS.items():
                if field not in problem["solution"]:
                    self.errors.append(f"Missing field in solution: '{field}'")
                elif not isinstance(problem["solution"][field], expected_type):
                    self.errors.append(f"Solution field '{field}' has wrong type. Expected {expected_type.__name__}")
            
            # Validate language
            if "language" in problem["solution"]:
                if problem["solution"]["language"].lower() != "csharp":
                    self.warnings.append(f"Expected language 'csharp', got '{problem['solution']['language']}'")
            
            # Validate code
            if "code" in problem["solution"]:
                if not problem["solution"]["code"].strip():
                    self.errors.append("Solution code cannot be empty")
                elif len(problem["solution"]["code"]) < 20:
                    self.warnings.append("Solution code seems too short (< 20 characters)")
            
            # Validate complexity notation
            for complexity_field in ["time_complexity", "space_complexity"]:
                if complexity_field in problem["solution"]:
                    value = problem["solution"][complexity_field]
                    if not re.match(r'^O\(.+\)$', value):
                        self.warnings.append(f"{complexity_field} should use Big O notation (e.g., O(n), O(1))")
        
        is_valid = len(self.errors) == 0
        return is_valid, self.errors.copy(), self.warnings.copy()


def validate_json_file(filepath: str) -> Tuple[bool, Dict[str, Any]]:
    """Validate the entire JSON file."""
    print(f"Validating: {filepath}")
    print("=" * 70)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: File not found: {filepath}")
        return False, {}
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON format: {e}")
        return False, {}
    
    # Validate top-level structure
    if "metadata" not in data:
        print("WARNING: Missing 'metadata' section")
    
    if "problems" not in data:
        print("ERROR: Missing 'problems' array")
        return False, {}
    
    if not isinstance(data["problems"], list):
        print("ERROR: 'problems' must be an array")
        return False, {}
    
    # Validate each problem
    validator = ProblemValidator()
    results = {
        "total": len(data["problems"]),
        "valid": 0,
        "invalid": 0,
        "warnings": 0,
        "details": []
    }
    
    print(f"\nValidating {results['total']} problems...\n")
    
    for i, problem in enumerate(data["problems"]):
        problem_id = problem.get("id", f"Problem #{i+1}")
        is_valid, errors, warnings = validator.validate_problem(problem, i)
        
        if is_valid:
            results["valid"] += 1
            if warnings:
                results["warnings"] += len(warnings)
                print(f"✓ {problem_id}: Valid (with {len(warnings)} warning(s))")
                for warning in warnings:
                    print(f"  ⚠ {warning}")
            else:
                print(f"✓ {problem_id}: Valid")
        else:
            results["invalid"] += 1
            print(f"✗ {problem_id}: Invalid")
            for error in errors:
                print(f"  ✗ {error}")
            if warnings:
                results["warnings"] += len(warnings)
                for warning in warnings:
                    print(f"  ⚠ {warning}")
        
        results["details"].append({
            "id": problem_id,
            "valid": is_valid,
            "errors": errors,
            "warnings": warnings
        })
    
    return results["invalid"] == 0, results


def print_summary(results: Dict[str, Any]):
    """Print validation summary."""
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)
    print(f"Total Problems:    {results['total']}")
    print(f"Valid:             {results['valid']} ({results['valid']/results['total']*100:.1f}%)")
    print(f"Invalid:           {results['invalid']}")
    print(f"Total Warnings:    {results['warnings']}")
    
    if results['invalid'] == 0:
        print("\n✅ All problems are valid!")
    else:
        print(f"\n❌ {results['invalid']} problem(s) failed validation")
        print("\nFailed problems:")
        for detail in results['details']:
            if not detail['valid']:
                print(f"  - {detail['id']}: {len(detail['errors'])} error(s)")


def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python validate_json.py <json_file>")
        print("Example: python validate_json.py problems_output.json")
        sys.exit(1)
    
    filepath = sys.argv[1]
    all_valid, results = validate_json_file(filepath)
    
    if results:
        print_summary(results)
    
    sys.exit(0 if all_valid else 1)


if __name__ == "__main__":
    main()
