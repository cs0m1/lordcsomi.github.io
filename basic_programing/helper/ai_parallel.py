#!/usr/bin/env python3
"""
Parallel AI Problem Generator with Automatic Validation
Processes all algorithm problems concurrently and generates a comprehensive JSON file.
Automatically validates AI responses and provides feedback for corrections.
"""

import json
import time
import re
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types
import os

# Problem definitions from algorithms_and_logic_problems.txt
PROBLEMS = [
    {"id": "PROB_001", "title": "Count Words in String", "slide": 4, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_002", "title": "Selection Sort (Iterative)", "slide": 5, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_003", "title": "Sum of Multiples (3 or 5)", "slide": 6, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_004", "title": "Fibonacci Sequence (Even terms)", "slide": 7, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_005", "title": "Largest Prime Factor", "slide": "8, 9", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_006", "title": "Palindrome Check (Numeric)", "slide": "10, 11", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_007", "title": "Smallest Multiple (LCM 1 to 20)", "slide": "12, 13, 14", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_008", "title": "Sum Square Difference", "slide": "15, 16", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_009", "title": "Sieve of Eratosthenes (Prime Finding)", "slide": "18, 19, 20, 21, 22", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_010", "title": "Finding the Nth Prime", "slide": 23, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_011", "title": "Largest Product in a String (Sliding Window)", "slide": "24, 25", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_012", "title": "Pythagorean Triplet (a²+b²=c²)", "slide": "26, 27", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_013", "title": "Sum of Primes (using Sieve)", "slide": 28, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_014", "title": "Largest Product in a Grid (2D Array Traversal)", "slide": "29, 30, 31", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_015", "title": "Triangular Numbers & Divisor Counting", "slide": "32, 33", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_016", "title": "Large Sum (BigInteger Addition)", "slide": "34, 35, 36, 37", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_017", "title": "Collatz Sequence (3n + 1)", "slide": "38, 39", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_018", "title": "Lattice Paths (Grid Walking - Recursion vs DP)", "slide": "40, 41, 42", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_019", "title": "Power Digit Sum (2^1000)", "slide": 43, "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_020", "title": "Number to Words (1 to 1000)", "slide": "44, 45", "part": "PSUP Last Lecture (The 'Project Euler' & Exam Prep Slides)", "page": 1},
    {"id": "PROB_021", "title": "Triangle Validity Check (Geometry)", "slide": "12, 13", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_022", "title": "Point inside Circle (Distance Formula)", "slide": "23, 24, 25", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_023", "title": "Array to String (Join with separators)", "slide": 27, "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_024", "title": "Find Maximum in Array (Iterative)", "slide": 28, "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_025", "title": "Frequency Count (Occurrences in Array)", "slide": "29, 30", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_026", "title": "Matrix Statistics (2D Arrays)", "slide": 31, "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_027", "title": "Array Sum (Recursive)", "slide": 38, "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_028", "title": "Find Maximum (Recursive)", "slide": 39, "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_029", "title": "Binary Search (Iterative & Recursive)", "slide": "40, 46", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_030", "title": "Bubble Sort", "slide": "41, 42", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_031", "title": "String Comparison", "slide": 44, "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_032", "title": "Selection Sort (Standard)", "slide": "50, 51", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_033", "title": "Insertion Sort", "slide": "52, 53", "part": "Part 2: OOP & Algorithms", "page": 2},
    {"id": "PROB_034", "title": "Basic Math Operators (Overflow/Underflow)", "slide": "20-22", "part": "Part 1: Introduction", "page": 3},
    {"id": "PROB_035", "title": "Swap Logic (Short-circuiting)", "slide": 40, "part": "Part 1: Introduction", "page": 3},
    {"id": "PROB_036", "title": "String Reverse / Split", "slide": 60, "part": "Part 1: Introduction", "page": 3},
    {"id": "PROB_037", "title": "String Correction (Case sensitivity)", "slide": "62-65", "part": "Part 1: Introduction", "page": 3},
    {"id": "PROB_038", "title": "File Handling (Read/Write Text)", "slide": "69, 70, 71", "part": "Part 1: Introduction", "page": 3},
    {"id": "PROB_039", "title": "Binary File Handling", "slide": 72, "part": "Part 1: Introduction", "page": 3},
    {"id": "PROB_040", "title": "LINQ (Word Count - Bonus)", "slide": 79, "part": "Part 1: Introduction", "page": 3},
]

def validate_problem_data(problem_data, problem_id):
    """Validate that the generated problem data has all required fields and correct format."""
    errors = []
    
    # Required fields check
    required_fields = ["id", "title", "description", "difficulty", "reference", "hint", "algorithm", "solution"]
    for field in required_fields:
        if field not in problem_data:
            errors.append(f"Missing required field: '{field}'")
    
    # ID format and value check
    if "id" in problem_data:
        if not re.match(r'^PROB_\d{3}$', problem_data["id"]):
            errors.append(f"Invalid ID format: '{problem_data['id']}'. Expected format: PROB_XXX")
        elif problem_data["id"] != problem_id:
            errors.append(f"ID mismatch: expected '{problem_id}', got '{problem_data['id']}'")
    
    # Difficulty range check
    if "difficulty" in problem_data:
        if not isinstance(problem_data["difficulty"], int):
            errors.append(f"Difficulty must be an integer, got {type(problem_data['difficulty']).__name__}")
        elif not (1 <= problem_data["difficulty"] <= 10):
            errors.append(f"Difficulty must be between 1 and 10, got {problem_data['difficulty']}")
    
    # String fields must not be empty
    for field in ["title", "description", "hint"]:
        if field in problem_data and not problem_data[field].strip():
            errors.append(f"Field '{field}' cannot be empty")
    
    # Reference structure check
    if "reference" in problem_data:
        if not isinstance(problem_data["reference"], dict):
            errors.append("'reference' must be a dictionary")
        else:
            ref_fields = ["part", "slide", "page"]
            for rf in ref_fields:
                if rf not in problem_data["reference"]:
                    errors.append(f"Missing field in reference: '{rf}'")
    
    # Algorithm structure check
    if "algorithm" in problem_data:
        if not isinstance(problem_data["algorithm"], dict):
            errors.append("'algorithm' must be a dictionary")
        else:
            if "description" not in problem_data["algorithm"]:
                errors.append("Missing 'description' in algorithm")
            if "steps" not in problem_data["algorithm"]:
                errors.append("Missing 'steps' in algorithm")
            elif not isinstance(problem_data["algorithm"]["steps"], list):
                errors.append("'steps' in algorithm must be a list")
            elif len(problem_data["algorithm"]["steps"]) == 0:
                errors.append("'steps' in algorithm cannot be empty")
    
    # Solution structure check
    if "solution" in problem_data:
        if not isinstance(problem_data["solution"], dict):
            errors.append("'solution' must be a dictionary")
        else:
            sol_fields = ["language", "code", "explanation", "time_complexity", "space_complexity"]
            for sf in sol_fields:
                if sf not in problem_data["solution"]:
                    errors.append(f"Missing field in solution: '{sf}'")
            
            # Language check
            if "language" in problem_data["solution"] and problem_data["solution"]["language"].lower() != "csharp":
                errors.append(f"Language must be 'csharp', got '{problem_data['solution']['language']}'")
            
            # Code must not be empty
            if "code" in problem_data["solution"] and not problem_data["solution"]["code"].strip():
                errors.append("Solution code cannot be empty")
    
    return errors

def create_prompt(problem, previous_errors=None):
    """Create a detailed prompt for the AI to generate problem information."""
    base_prompt = f"""You are a computer science instructor creating comprehensive learning materials for the PSUP (Programming and Software Using Programming) course.

For the following algorithm problem, provide a detailed JSON response with ALL required fields:

**Problem Title:** {problem['title']}
**Problem ID:** {problem['id']}
**Slide Reference:** {problem['slide']}
**Part:** {problem['part']}

Generate a JSON object with this EXACT structure (return ONLY valid JSON, no other text):

{{
  "id": "{problem['id']}",
  "title": "{problem['title']}",
  "description": "A clear, concise description of what the problem asks (2-3 sentences)",
  "difficulty": <integer 1-10, where 1=very easy, 10=very complex>,
  "reference": {{
    "part": "{problem['part']}",
    "slide": "{problem['slide']}",
    "page": {problem['page']}
  }},
  "hint": "A helpful hint that guides students without revealing the solution",
  "algorithm": {{
    "description": "A brief overview of the algorithmic approach",
    "steps": [
      "Step 1: Detailed step description",
      "Step 2: Detailed step description",
      "Step 3: Detailed step description"
    ]
  }},
  "solution": {{
    "language": "csharp",
    "code": "Complete, working C# code solution (use proper C# syntax with proper escaping for JSON)",
    "explanation": "Explanation of how the solution works and why it's effective",
    "time_complexity": "Big O notation (e.g., O(n), O(n²), O(log n))",
    "space_complexity": "Big O notation for space"
  }}
}}

Requirements:
- The description should be clear and educational
- Difficulty should reflect the complexity for a programming student
- The hint should be genuinely helpful but not give away the solution
- Algorithm steps should be detailed enough to guide implementation
- C# code must be complete, compilable, and follow best practices
- Use proper newline characters (\\n) in the code string
- Explanation should help students understand WHY the solution works
- Include accurate time and space complexity analysis

Return ONLY the JSON object, no additional text or markdown formatting."""

    if previous_errors:
        error_feedback = "\n\n**IMPORTANT: Your previous response had validation errors. Please fix these issues:**\n\n"
        for i, error in enumerate(previous_errors, 1):
            error_feedback += f"{i}. {error}\n"
        error_feedback += "\nPlease provide a corrected JSON response that addresses all the above errors."
        return base_prompt + error_feedback
    
    return base_prompt

def generate_problem_data(problem, api_key, max_retries=5):
    """Generate data for a single problem using the Gemini API with automatic validation."""
    client = genai.Client(api_key=api_key)
    model = "gemini-3-pro-preview"
    
    previous_errors = None
    
    for attempt in range(max_retries):
        try:
            if attempt == 0:
                print(f"  Processing {problem['id']}: {problem['title']}")
            else:
                print(f"  Retrying {problem['id']} (attempt {attempt + 1}/{max_retries}) - fixing validation errors")
            
            prompt_text = create_prompt(problem, previous_errors)
            
            generate_content_config = types.GenerateContentConfig(
                temperature=0.7,
            )
            
            response_text = ""
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=prompt_text,
                config=generate_content_config,
            ):
                if chunk.text:
                    response_text += chunk.text
            
            # Try to extract JSON from the response
            response_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            try:
                problem_data = json.loads(response_text)
            except json.JSONDecodeError as json_err:
                print(f"  ⚠ JSON parsing error: {str(json_err)}")
                previous_errors = [f"JSON parsing error: {str(json_err)}. Ensure response is valid JSON."]
                time.sleep(2)
                continue
            
            # Validate the parsed data
            validation_errors = validate_problem_data(problem_data, problem['id'])
            
            if not validation_errors:
                print(f"  ✓ Successfully processed and validated {problem['id']}")
                return problem_data
            else:
                print(f"  ⚠ Validation errors found ({len(validation_errors)} issue(s))")
                for err in validation_errors[:3]:  # Show first 3 errors
                    print(f"     - {err}")
                previous_errors = validation_errors
                time.sleep(2)
                continue
            
        except Exception as e:
            print(f"  ✗ Error processing {problem['id']} (attempt {attempt + 1}): {str(e)}")
            if attempt == max_retries - 1:
                print(f"  ✗ Failed to process {problem['id']} after {max_retries} attempts")
                return None
            time.sleep(2)
    
    print(f"  ✗ Failed to process {problem['id']} after {max_retries} attempts")
    return None

def process_batch(problems, api_key, batch_num):
    """Process a batch of problems in parallel."""
    print(f"\n{'='*60}")
    print(f"Processing Batch {batch_num} ({len(problems)} problems)")
    print(f"{'='*60}")
    
    results = []
    with ThreadPoolExecutor(max_workers=len(problems)) as executor:
        future_to_problem = {
            executor.submit(generate_problem_data, problem, api_key): problem 
            for problem in problems
        }
        
        for future in as_completed(future_to_problem):
            result = future.result()
            if result:
                results.append(result)
    
    return results

def main():
    """Main function to orchestrate the parallel processing."""
    print("="*60)
    print("AI Problem Generator with Auto-Validation")
    print("="*60)
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Try to read from .env file
        try:
            with open(".env", "r") as f:
                for line in f:
                    if "GEMINI_API_KEY" in line and "=" in line:
                        # Handle formats like: GEMINI_API_KEY=value or GEMINI_API_KEY = value
                        api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
        except:
            pass
    
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment or .env file")
        return
    
    print(f"\nTotal problems to process: {len(PROBLEMS)}")
    print(f"Processing in batches of 20 to respect rate limits...")
    print(f"Each problem will be automatically validated and corrected if needed.\n")
    
    all_results = []
    
    # Process in batches of 20 (Tier 1 RPM limit)
    batch_size = 20
    for i in range(0, len(PROBLEMS), batch_size):
        batch = PROBLEMS[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        batch_results = process_batch(batch, api_key, batch_num)
        all_results.extend(batch_results)
        
        print(f"\nBatch {batch_num} complete: {len(batch_results)}/{len(batch)} successful")
        
        # Wait between batches to avoid rate limiting
        if i + batch_size < len(PROBLEMS):
            wait_time = 65  # Wait 65 seconds to be safe
            print(f"\nWaiting {wait_time} seconds before next batch to respect rate limits...")
            time.sleep(wait_time)
    
    # Create final JSON output
    output = {
        "metadata": {
            "total_problems": len(PROBLEMS),
            "successful_generations": len(all_results),
            "generated_date": datetime.utcnow().isoformat() + "Z",
            "model_used": "gemini-3-pro-preview",
            "language": "csharp",
            "course": "PSUP - Programming and Software Using Programming",
            "validated": True
        },
        "problems": sorted(all_results, key=lambda x: x.get("id", ""))
    }
    
    # Save to file
    output_file = "problems_output.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("Processing Complete!")
    print("="*60)
    print(f"Total problems processed: {len(all_results)}/{len(PROBLEMS)}")
    print(f"Success rate: {len(all_results)/len(PROBLEMS)*100:.1f}%")
    print(f"All problems were automatically validated!")
    print(f"\nOutput saved to: {output_file}")
    
    if len(all_results) < len(PROBLEMS):
        failed = len(PROBLEMS) - len(all_results)
        print(f"\nWarning: {failed} problem(s) failed to process after multiple attempts")
        print("You may want to run the script again for failed problems")
    else:
        print(f"\n🎉 All {len(PROBLEMS)} problems successfully generated and validated!")

if __name__ == "__main__":
    main()
