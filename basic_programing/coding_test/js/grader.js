// AI Grader using Gemini
class AIGrader {
    constructor() {
        this.apiKey = null;
        this.model = 'gemini-3-flash-preview'; // Default model
        this.availableModels = [
            { id: 'gemini-flash-latest', name: 'Gemini Flash (Fastest)', description: 'Fastest but least accurate' },
            { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Balanced)', description: 'Fast and somewhat clever - recommended' },
            { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Smartest)', description: 'Most accurate but slowest' }
        ];
        this.loadSettings();
    }

    loadSettings() {
        // Load from localStorage
        this.apiKey = localStorage.getItem('psup_gemini_api_key');
        this.model = localStorage.getItem('psup_gemini_model') || 'gemini-3-flash-preview';
    }

    saveModel(modelId) {
        localStorage.setItem('psup_gemini_model', modelId);
        this.model = modelId;
    }

    getModel() {
        return this.model;
    }

    getModelName() {
        const found = this.availableModels.find(m => m.id === this.model);
        return found ? found.name : this.model;
    }

    saveApiKey(key) {
        localStorage.setItem('psup_gemini_api_key', key);
        this.apiKey = key;
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    promptForApiKey() {
        return new Promise((resolve) => {
            const modal = document.getElementById('api-key-modal');
            const input = document.getElementById('api-key-input');
            const modelSelect = document.getElementById('model-select');
            const saveBtn = document.getElementById('save-api-key');
            const skipBtn = document.getElementById('skip-api-key');

            if (!modal) {
                resolve(false);
                return;
            }

            modal.style.display = 'flex';
            input.value = this.apiKey || '';
            if (modelSelect) {
                modelSelect.value = this.model;
            }
            input.focus();

            const handleSave = () => {
                const key = input.value.trim();
                if (key) {
                    this.saveApiKey(key);
                }
                // Save model selection
                if (modelSelect) {
                    this.saveModel(modelSelect.value);
                }
                modal.style.display = 'none';
                resolve(true);
            };

            const handleSkip = () => {
                modal.style.display = 'none';
                resolve(false);
            };

            saveBtn.onclick = handleSave;
            skipBtn.onclick = handleSkip;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleSave(); };
        });
    }

    createPrompt(problem, userCode) {
        return `You are a strict C# coding instructor grading a programming exam.

**Problem Information:**
Title: ${problem.title}
ID: ${problem.id}
Difficulty: ${problem.difficulty}/10

**Problem Description:**
${problem.description}

**Expected Algorithm:**
${problem.algorithm.description}

Steps:
${problem.algorithm.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Expected Complexity:**
Time: ${problem.solution.time_complexity}
Space: ${problem.solution.space_complexity}

**Student's Code:**
\`\`\`csharp
${userCode}
\`\`\`

**CRITICAL: ZERO SCORE RULES**
Before grading, check if the code deserves ANY points:
- If the code is nonsense (like "test", "hello", random text) → Give 0
- If the code has NO C# structure (no semicolons, no braces, no keywords) → Give 0
- If the code is completely unrelated to the problem → Give 0
- Only award partial credit if there is a genuine attempt at solving the problem

**Grading Instructions (only if code is a genuine attempt):**
Grade with 9/10 syntax strictness (very strict about C# conventions):

1. **Correctness (40 points max):**
   - Does it solve the problem correctly?
   - Does it handle edge cases?
   - Does the logic match the expected algorithm approach?
   - BE FLEXIBLE: Accept any correct approach, not just the expected one

2. **Syntax & Quality (40 points max):**
   - Proper C# naming conventions (PascalCase for classes/methods, camelCase for variables)?
   - Semicolons, brackets, braces correctly placed?
   - Would this compile without errors?
   - Clean, readable code structure?
   - BE VERY STRICT (9/10 strictness) - deduct points for any syntax issues

3. **Efficiency (20 points max):**
   - Does it match or exceed the expected time/space complexity?
   - No unnecessary operations?
   - Efficient use of data structures?

**Response Format:**
Return ONLY a valid JSON object (no markdown, no extra text):

{
  "totalScore": 85,
  "breakdown": {
    "correctness": 38,
    "syntaxQuality": 32,
    "efficiency": 15
  },
  "feedback": "Good solution that correctly solves the problem. Minor syntax issues with variable naming.",
  "syntaxErrors": [
    "Line 5: Variable 'word_count' should be 'wordCount' (camelCase)"
  ],
  "suggestions": [
    "Use camelCase for all local variables"
  ],
  "passes": true
}

**Important:**
- totalScore must be between 0-100
- breakdown: correctness (0-40), syntaxQuality (0-40), efficiency (0-20)
- breakdown values must sum to totalScore
- passes is true if totalScore >= 70
- GIVE 0 POINTS for nonsense/non-code submissions
- Return ONLY the JSON object`;
    }

    async gradeCode(problem, userCode) {
        // Reload settings in case they were updated
        this.loadSettings();
        
        if (!this.apiKey) {
            console.log('No API key found, using mock grading');
            return this.mockGrade(userCode, 'No API key configured');
        }

        try {
            const prompt = this.createPrompt(problem, userCode);
            
            console.log(`Making API request to ${this.model}...`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.3,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 8192,
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('API Error Response:', errorBody);
                throw new Error(`API request failed: ${response.status} - ${errorBody}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            if (!data.candidates || !data.candidates[0]?.content?.parts) {
                throw new Error('Unexpected API response structure');
            }
            
            // Gemini 3 Pro with thinking returns multiple parts
            // The JSON response is usually in the last part (after thinking)
            const parts = data.candidates[0].content.parts;
            let text = '';
            
            // Look for the part containing JSON (check all parts)
            for (const part of parts) {
                if (part.text) {
                    const partText = part.text.trim();
                    // Check if this part contains JSON-like content
                    if (partText.includes('"totalScore"') || partText.startsWith('{')) {
                        text = partText;
                        break;
                    }
                    // If no JSON found yet, keep the last text part
                    text = partText;
                }
            }
            
            if (!text) {
                throw new Error('No text content in API response');
            }
            
            console.log('Extracted text:', text.substring(0, 200) + '...');
            
            let jsonText = text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.substring(7);
            }
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length - 3);
            }
            jsonText = jsonText.trim();

            const result = JSON.parse(jsonText);
            
            if (result.totalScore === undefined || !result.breakdown || !result.feedback) {
                throw new Error('Invalid response format from AI: missing required fields');
            }

            console.log('AI Grading successful:', result);
            return result;

        } catch (error) {
            console.error('Grading error:', error);
            return this.mockGrade(userCode, error.message);
        }
    }

    mockGrade(userCode, errorReason = null) {
        const code = userCode.trim();
        const codeLength = code.length;
        
        // Check for C# structure indicators
        const hasSemicolons = code.includes(';');
        const hasBraces = code.includes('{') && code.includes('}');
        const hasKeywords = code.match(/\b(int|string|void|public|private|class|for|while|if|return|using|namespace|static)\b/);
        
        // If code has no C# structure at all, give 0
        if (!hasSemicolons && !hasBraces && !hasKeywords) {
            return {
                totalScore: 0,
                breakdown: {
                    correctness: 0,
                    syntaxQuality: 0,
                    efficiency: 0
                },
                feedback: 'This does not appear to be valid C# code. Please write a proper solution with C# syntax.',
                syntaxErrors: ['No valid C# code structure detected'],
                suggestions: ['Write actual C# code with proper syntax'],
                passes: false
            };
        }
        
        // Very short code with minimal structure - likely incomplete
        if (codeLength < 30) {
            return {
                totalScore: 0,
                breakdown: {
                    correctness: 0,
                    syntaxQuality: 0,
                    efficiency: 0
                },
                feedback: 'Code is too short. Please provide a complete solution.',
                syntaxErrors: ['Code appears incomplete or invalid'],
                suggestions: ['Implement the full solution'],
                passes: false
            };
        }
        
        // Basic scoring for mock grade (scale 0-100)
        let score = 20; // Start with minimal credit for attempting
        
        if (hasSemicolons) score += 10;
        if (hasBraces) score += 10;
        if (hasKeywords) score += 10;
        if (code.toLowerCase().includes('return')) score += 10;
        if (codeLength > 100) score += 5;
        if (codeLength > 200) score += 5;
        
        // Cap at 70 for mock grading (can't give full marks without real AI analysis)
        score = Math.min(score, 70);

        // Build feedback message with error reason if provided
        let feedback = 'NOTE: AI grading unavailable - using mock grade.';
        if (errorReason) {
            feedback += ` Error: ${errorReason}`;
        }
        feedback += ' Check browser console (F12) for details.';

        return {
            totalScore: score,
            breakdown: {
                correctness: Math.round(score * 0.4),
                syntaxQuality: Math.round(score * 0.4),
                efficiency: Math.round(score * 0.2)
            },
            feedback: feedback,
            syntaxErrors: errorReason ? [`API Error: ${errorReason}`] : [],
            suggestions: ['Check your API key in settings', 'Make sure you have a valid Gemini API key'],
            passes: score >= 70
        };
    }
}
