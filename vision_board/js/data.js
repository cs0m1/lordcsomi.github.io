// Vision Board Data - All 4 Areas
const DATA = {
    learning: {
        id: 'learning',
        title: 'Learning & University',
        icon: 'ph-book-open',
        theme: 'blue',
        themeColors: { 
            bg: 'bg-blue-50', 
            text: 'text-blue-600', 
            border: 'border-blue-200', 
            btn: 'bg-blue-600 hover:bg-blue-700', 
            iconBg: 'bg-blue-500' 
        },
        gradient: 'from-blue-500 to-indigo-600',
        vision: "Become a Cybersecurity & AI Professional",
        subtitle: "Study smart, specialize in what AI can't replace",
        explanation: "I'm in my 1st semester of Computer Science, still figuring things out. What I do know is that AI is reshaping the IT job market fast—so I want to study something that pays well AND won't be replaced by AI. That's why I'm focusing on security: all these vibe-coded AI apps still need humans to make sure they're actually secure. Plus, AI/ML is the hot topic of this decade, so understanding it gives me an edge. To stand out when applying for internships, I'm planning to get industry certifications (like CompTIA Security+) before graduation.",
        stats: [
            { label: "Status", value: "Sem 1" },
            { label: "Focus", value: "Security + AI" },
            { label: "Goal", value: "Internship" }
        ],
        roadmap: [
            { year: "2025", milestone: "Ace Semester Finals", detail: "Survive 1st semester exams", status: "current" },
            { year: "2026", milestone: "Get First Certification", detail: "CompTIA Security+ or similar", status: "future" },
            { year: "2027", milestone: "Finish BSc", detail: "Graduate as fast as possible", status: "future" },
            { year: "2028", milestone: "Land Internship", detail: "Stand out with certs & skills", status: "future" },
            { year: "2029+", milestone: "Full-Time Security Role", detail: "The goal 🎯", status: "future" }
        ],
        todos: [
            { id: 'l1', text: "Pass all exams with Grade 4+", type: 'short' },
            { id: 'l2', text: "Complete Physics self-assessments", type: 'short' },
            { id: 'l3', text: "Ace Programming written exam", type: 'short' },
            { id: 'l4', text: "Ace Mathematical Foundations of Informatics (MFI)", type: 'short' },
            { id: 'ls1', text: "Learn C language deeply", type: 'skills' },
            { id: 'ls2', text: "Get comfortable with Linux & CLI", type: 'skills' },
            { id: 'ls3', text: "Earn industry certifications (CompTIA, etc.)", type: 'skills' },
            { id: 'ls4', text: "Understand networking & system architecture", type: 'skills' },
            { id: 'ls5', text: "Learn cloud platforms (AWS/Azure)", type: 'skills' },
        ],
        visuals: [
            { title: "Cybersecurity", icon: "ph-shield-check", color: "bg-blue-500" },
            { title: "Neural Networks", icon: "ph-brain", color: "bg-indigo-500" },
            { title: "Coding", icon: "ph-code", color: "bg-sky-500" },
            { title: "Graduation", icon: "ph-graduation-cap", color: "bg-blue-600" },
        ],
        quote: "The best way to predict the future is to create it.",
        quoteAuthor: "Abraham Lincoln"
    },

    fitness: {
        id: 'fitness',
        title: 'Fitness & Outdoors',
        icon: 'ph-mountains',
        theme: 'teal',
        themeColors: { 
            bg: 'bg-teal-50', 
            text: 'text-teal-600', 
            border: 'border-teal-200', 
            btn: 'bg-teal-600 hover:bg-teal-700', 
            iconBg: 'bg-teal-500' 
        },
        gradient: 'from-teal-400 to-emerald-600',
        vision: "Always pushing my limits — in the mountains and beyond",
        subtitle: "From the Alps to Kilimanjaro: chasing peaks and adventure",
        explanation: "I grew up in an active, adventure-driven family, and exploring the outdoors has always felt natural to me. I've hiked above 3000m in the Alps, climbed, run, swam, slacklined, and taken on everything from via ferrata routes to freediving. The mountains — especially the Alps — are where I feel most alive. Pushing my limits is part of who I am, whether it's on a climbing wall, on a trail, or in my personal growth. I value real connections and love meeting people who share the same energy, curiosity, and passion for adventure.",
        stats: [
            { label: "Climb", value: "7b" },
            { label: "Run 10k", value: "55m" },
            { label: "Fly", value: "2026" }
        ],
        roadmap: [
            { year: "2026", milestone: "Paragliding A-License", detail: "Learn to fly and earn license", status: "current" },
            { year: "2026", milestone: "Half Marathon", detail: "Complete my first half marathon", status: "future" },
            { year: "2026", milestone: "Find Adventure Partners", detail: "Connect with like-minded outdoor enthusiasts", status: "future" },
            { year: "2027", milestone: "Alps Hike & Fly", detail: "Combine hiking and paragliding in the Alps", status: "future" },
            { year: "2028+", milestone: "Climb Kilimanjaro", detail: "My first real high-altitude mountain 🏔️", status: "future" }
        ],
        todos: [
            { id: 'f1', text: "Complete first outdoor lead climb", type: 'short' },
            { id: 'f2', text: "Finish a half-marathon", type: 'short' },
            { id: 'f3', text: "Obtain paragliding A license", type: 'short' },
            { id: 'f4', text: "First solo paragliding flight", type: 'short' },
            { id: 'f5', text: "Find like-minded adventure partners", type: 'short' },
            { id: 'fh1', text: "Hike above 1000m", type: 'long' },
            { id: 'fh2', text: "Hike above 2000m", type: 'long' },
            { id: 'fh3', text: "Hike above 3000m", type: 'long' },
            { id: 'fh4', text: "Hike above 4000m", type: 'long' },
            { id: 'fh5', text: "Hike above 6000m (Kilimanjaro)", type: 'long' },
            { id: 'fl1', text: "Hike & fly in the Austrian Alps", type: 'long' },
            { id: 'fl2', text: "Climb outdoor 7c+ boulder", type: 'long' },
            { id: 'fl3', text: "Complete a triathlon with friends", type: 'long' },
        ],
        visuals: [
            { title: "Climbing", icon: "ph-mountains", color: "bg-teal-600" },
            { title: "Running", icon: "ph-sneaker-move", color: "bg-emerald-500" },
            { title: "Paragliding", icon: "ph-parachute", color: "bg-teal-400" },
            { title: "Alps", icon: "ph-map-pin", color: "bg-green-600" },
        ],
        quote: "The mountains are calling and I must go.",
        quoteAuthor: "John Muir"
    },

    projects: {
        id: 'projects',
        title: 'Projects & Creativity',
        icon: 'ph-laptop',
        theme: 'violet',
        themeColors: { 
            bg: 'bg-violet-50', 
            text: 'text-violet-600', 
            border: 'border-violet-200', 
            btn: 'bg-violet-600 hover:bg-violet-700', 
            iconBg: 'bg-violet-500' 
        },
        gradient: 'from-violet-500 to-purple-600',
        vision: "Build things that matter — games, AI tools, platforms that help people",
        subtitle: "From personal tools to impactful products",
        explanation: "I've always built programs to solve my own problems — niche tools that worked for me but didn't reach others. Now I want to create something with real impact. I have a game idea I've been developing in my head for years, and I'm planning to learn game development through a uni course. I'm also deeply interested in AI/ML and want to build something meaningful in that space — whether it's a helpful platform, an intelligent tool, or something entirely new. The goal is to stop just solving my own problems and start creating for others.",
        stats: [
            { label: "Focus", value: "Impact" },
            { label: "Stack", value: "Full" },
            { label: "Goal", value: "Create" }
        ],
        roadmap: [
            { year: "2026", milestone: "Learn Game Engine", detail: "Take uni course on game development", status: "current" },
            { year: "2026", milestone: "Launch Dream Game", detail: "Build and release game MVP", status: "future" },
            { year: "2027", milestone: "AI/ML Project", detail: "Build something with AI/ML", status: "future" },
            { year: "2028+", milestone: "Platform for People", detail: "Create something that reaches people 🚀", status: "future" }
        ],
        todos: [
            { id: 'p1', text: "Build portfolio website", type: 'short' },
            { id: 'p2', text: "Learn game engine (Unity/Godot)", type: 'short' },
            { id: 'p3', text: "Build and launch dream game", type: 'short' },
            { id: 'p4', text: "Create an AI/ML powered project", type: 'short' },
            { id: 'p5', text: "Contribute to open source", type: 'short' },
            { id: 'pl1', text: "Build a platform that helps people", type: 'long' },
            { id: 'pl2', text: "Explore cybersecurity tool development", type: 'long' },
            { id: 'pl3', text: "Master full-stack development", type: 'long' },
        ],
        visuals: [
            { title: "Game Dev", icon: "ph-game-controller", color: "bg-purple-600" },
            { title: "AI/ML", icon: "ph-robot", color: "bg-violet-500" },
            { title: "Hacking", icon: "ph-terminal-window", color: "bg-fuchsia-600" },
            { title: "Ideas", icon: "ph-lightbulb", color: "bg-purple-400" },
        ],
        quote: "First, solve the problem. Then, write the code.",
        quoteAuthor: "John Johnson"
    },

    lifestyle: {
        id: 'lifestyle',
        title: 'Lifestyle & Independence',
        icon: 'ph-sun-horizon',
        theme: 'amber',
        themeColors: { 
            bg: 'bg-amber-50', 
            text: 'text-amber-600', 
            border: 'border-amber-200', 
            btn: 'bg-amber-600 hover:bg-amber-700', 
            iconBg: 'bg-amber-500' 
        },
        gradient: 'from-amber-400 to-orange-600',
        vision: "Build a life of freedom, adventure, and purpose — on my own terms",
        subtitle: "Independence first, mountains always",
        explanation: "Independence is non-negotiable for me. I'm currently in a university dorm in Hungary, but I'm determined to never move back home. I want to earn my own money, make my own decisions, and build a life that reflects who I am. My dream is to work remotely — ideally in tech/security — so I can live near the mountains, pursue outdoor adventures, and still build meaningful projects. Whether it's the Alps or somewhere new, I want the freedom to explore, create, and connect with like-minded people.",
        stats: [
            { label: "Now", value: "Dorm" },
            { label: "Next", value: "Work" },
            { label: "Dream", value: "Alps" }
        ],
        roadmap: [
            { year: "2026", milestone: "Get Driving License", detail: "Freedom to travel", status: "current" },
            { year: "2026", milestone: "Start Earning", detail: "Part-time or freelance work", status: "future" },
            { year: "2027", milestone: "Own Apartment", detail: "Move out of dorm", status: "future" },
            { year: "2028", milestone: "Remote Job", detail: "Secure remote income", status: "future" },
            { year: "2030+", milestone: "Live Near Mountains", detail: "The dream life 🏔️", status: "future" }
        ],
        todos: [
            { id: 'li1', text: "Get driving license", type: 'short' },
            { id: 'li2', text: "Find part-time or freelance work", type: 'short' },
            { id: 'li3', text: "Save money consistently", type: 'short' },
            { id: 'li4', text: "Build skills for remote work", type: 'short' },
            { id: 'lil1', text: "Move to own apartment", type: 'long' },
            { id: 'lil2', text: "Work fully remote", type: 'long' },
            { id: 'lil3', text: "Live near mountains (Alps or similar)", type: 'long' },
            { id: 'lil4', text: "Build a life I'm proud of", type: 'long' },
        ],
        visuals: [
            { title: "Freedom", icon: "ph-car", color: "bg-amber-500" },
            { title: "Growth", icon: "ph-buildings", color: "bg-orange-500" },
            { title: "Remote Work", icon: "ph-briefcase", color: "bg-yellow-600" },
            { title: "Nature", icon: "ph-mountains", color: "bg-amber-700" },
        ],
        quote: "The goal isn't more money. The goal is living life on your terms.",
        quoteAuthor: "Chris Brogan"
    }
};
