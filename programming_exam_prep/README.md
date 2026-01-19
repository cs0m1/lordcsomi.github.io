# PSUP Exam Preparation System

A minimalist, programmer-styled exam preparation tool for the **Problemsolving Using Programming** course.

## 🎯 Features

### 1. **Countdown Dashboard**
- Real-time countdown to exam (January 20, 2026, 10:00 AM)
- Binary rain animation background (Matrix-style)
- Practice statistics overview
- Quick access to all modules

### 2. **Coding Practice Mode** ⭐
- **40 curated programming problems** from course materials
- **AI-powered grading** using Gemini Flash (9/10 syntax strictness)
- **Auto-save functionality** (every 30 seconds)
- **Session resume** - continue where you left off
- **Real-time timer** for each problem
- **Multiple practice modes:**
  - All problems (40)
  - Problem range (e.g., 1-10)
  - Weak areas (AI-suggested based on past performance)
- **Randomization option** for varied practice

### 3. **Grading System**
The AI grader evaluates code on three criteria:
- **Correctness (40 points)**: Does it solve the problem? Handle edge cases?
- **Syntax & Quality (40 points)**: C# conventions, clean code, proper formatting
- **Efficiency (20 points)**: Time/space complexity, optimal solutions

**Passing score: 70/100**

### 4. **Problem Structure**
Each problem includes:
- **Unique ID** (e.g., problem_1, problem_2)
- **Title** and description
- **Difficulty rating** (1-10)
- **Helpful hint**
- **Algorithm description** with step-by-step approach
- **Expected complexity** (time & space)
- **Source reference** (page and slide number)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Gemini API key (for AI grading)

### Setup

1. **Configure API Key**
   - Add your Gemini API key to the `.env` file in the parent directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Open the Application**
   - Navigate to `countdown/index.html` to start
   - Or directly open `coding_test/index.html` for practice

### No API Key?
The system works without an API key using fallback mock grading, but you won't get detailed AI feedback.

## 📁 Project Structure

```
programming_exam_prep/
├── countdown/              # Main dashboard
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── binary-rain.js  # Matrix-style animation
│       ├── countdown.js    # Timer logic
│       └── data.js         # Configuration
│
├── coding_test/           # Coding practice mode
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── binary-rain.js  # Shared animation
│       ├── grader.js       # AI grading engine
│       ├── test-engine.js  # Problem management
│       └── app.js          # Main controller
│
├── flashcards/            # Flashcard mode (coming soon)
│
├── statistics/            # Statistics dashboard (coming soon)
│
├── problems_data.json     # All 40 problems
└── README.md
```

## 🎨 Design Philosophy

**Minimalist Programmer Aesthetic:**
- Terminal/console inspired UI
- Monospace fonts (Consolas, Monaco)
- Dark theme (#0a0a0a background)
- Green (#00ff88) and cyan (#00d4ff) accents
- Binary rain animation
- Clean, distraction-free interface

## 💾 Data Storage

All data is stored in **browser localStorage**:
- `psup_coding_attempts` - All code submissions and grades
- `psup_current_session` - Active practice session (auto-saved)
- `psup_flashcard_progress` - Flashcard mastery levels
- `psup_ai_suggestions` - AI-generated study recommendations

## 🔧 How It Works

### Coding Practice Flow:

1. **Select Problems** - Choose all, range, or weak areas
2. **Start Session** - Problems load with timer
3. **Code Solution** - Write C# code in the editor
4. **Auto-Save** - Session saved every 30 seconds
5. **Submit** - AI grades with detailed feedback
6. **Review** - See scores breakdown and suggestions
7. **Continue** - Next problem or review results

### AI Grading Process:

1. User code + problem details sent to Gemini Flash
2. AI evaluates correctness, syntax, efficiency
3. Returns JSON with scores, feedback, suggestions
4. Results stored for statistics and recommendations

## 📊 Statistics & Analytics

The system tracks:
- Total practice attempts
- Average scores
- Time spent studying
- Mastery percentage
- Problem-specific performance
- Weak areas identification

## 🎓 Exam Information

- **Course:** Problemsolving Using Programming (NSXPP1EBNF)
- **Date:** January 20, 2026 (Tuesday)
- **Time:** 10:00 - 12:00 (120 minutes)
- **Location:** BA.1.32.Audmax
- **Total Problems:** 40

## 🛠️ Technical Stack

- **Frontend:** Pure HTML, CSS, JavaScript (no frameworks)
- **AI:** Google Gemini Flash 1.5
- **Storage:** Browser localStorage
- **Animation:** Canvas API (binary rain)
- **Architecture:** Class-based modular design

## 🔒 Privacy

- All data stored **locally** in your browser
- No server-side storage
- API key used only for AI grading requests
- Code submissions not saved externally

## 📝 Future Enhancements

- [ ] Flashcard study mode
- [ ] Comprehensive statistics dashboard
- [ ] AI study recommendations
- [ ] Export results to PDF
- [ ] Mobile responsive design improvements
- [ ] Dark/light theme toggle
- [ ] Code syntax highlighting
- [ ] Multiple language support

## 🤝 Contributing

This is a personal exam prep tool, but feel free to adapt it for your own use!

## 📄 License

Educational use only. Course materials property of respective instructors.

---

**Good luck with your exam! 🚀**

*Last updated: January 19, 2026*
