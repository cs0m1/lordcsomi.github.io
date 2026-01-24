# Helper Scripts

Python scripts for generating problem data using Gemini API.

## Setup

1. Create `.env` file:
```
GEMINI_API_KEY=your_key_here
```

2. Install dependencies:
```bash
pip install google-genai
```

3. Run:
```bash
python ai_parallel.py
```

## Files

- `ai_parallel.py` - Parallel problem generator with validation
- `ai.py` - Simple single-request example
- `merge_json.py` - JSON merge utility
- `validate_json.py` - JSON validation
- `algorithms_and_logic_problems.txt` - Problem definitions

## Notes

- Get API key: https://ai.google.dev/
- `.env` file is gitignored
- Output: `problems_output.json`
