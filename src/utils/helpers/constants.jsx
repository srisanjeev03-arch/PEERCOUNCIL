export const HELPER_PROMPTS = {
  study: [
    "I'm struggling with time management and procrastination. Can you help me create a study schedule?",
    "I have a big exam coming up and I'm feeling overwhelmed. What's the best way to prepare?",
    "I can't seem to focus when studying. What techniques can help improve my concentration?",
    "How can I break down complex topics into manageable study sessions?",
    "I'm having trouble remembering what I study. What are effective memorization techniques?",
    "Can you help me create a study plan for my upcoming finals week?"
  ],
  mindfulness: [
    "I'm feeling really anxious right now. What breathing exercises can help calm me down?",
    "Can you guide me through a quick 5-minute meditation for stress relief?",
    "I'm having trouble sleeping because my mind won't stop racing. What can help?",
    "What are some mindfulness practices I can incorporate into my daily routine?",
    "I'm feeling overwhelmed with negative thoughts. How can I practice mindful awareness?",
    "Can you suggest some grounding techniques for when I feel disconnected or anxious?"
  ],
  wellness: [
    "I've been feeling really stressed lately. What are some healthy coping strategies?",
    "How can I establish a better work-life balance to reduce burnout?",
    "I'm having trouble maintaining consistent self-care routines. Any suggestions?",
    "What are some signs that I might need to seek professional mental health support?",
    "How can I build resilience and better handle life's challenges?",
    "I'm feeling isolated and lonely. What are ways to improve social connections?"
  ]
};

export const STUDY_TIPS = {
  pomodoro: "Try the Pomodoro technique: 25 minutes focused study, 5 minutes break",
  active_recall: "Use active recall by testing yourself instead of just re-reading",
  spaced_repetition: "Space out your study sessions over multiple days for better retention",
  interleaving: "Mix different subjects or topics during study sessions",
  elaboration: "Explain concepts in your own words to deepen understanding"
};

export const MINDFULNESS_TECHNIQUES = {
  breathing: "4-7-8 breathing: Inhale 4 seconds, hold 7 seconds, exhale 8 seconds",
  body_scan: "Slowly scan through your body from head to toe, noticing sensations",
  five_senses: "Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste",
  mindful_walking: "Pay attention to each step and your body's movement while walking"
};

// UI constants
export const FONT_SIZE_OPTIONS = [
  { label: 'Small', value: 'sm' },
  { label: 'Default', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra Large', value: 'xl' }
];

export const COUNSELING_STYLES = [
  { value: 'supportive', label: 'Supportive', description: 'Warm, empathetic, and encouraging tone' },
  { value: 'direct', label: 'Direct', description: 'Clear, straightforward, and actionable guidance' },
  { value: 'reflective', label: 'Reflective', description: 'Helps you explore thoughts and feelings' },
  { value: 'motivational', label: 'Motivational', description: 'Focus on building momentum and habits' }
];

// AI Providers metadata for settings UI
export const AI_PROVIDERS = [
  {
    id: 'chatgpt',
    name: 'OpenAI (ChatGPT)',
    description: 'Use OpenAI models like GPT-3.5 and GPT-4',
    placeholder: 'sk-... your OpenAI API key',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Use Google Gemini models',
    placeholder: 'AIza... your Google API key',
    docsUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Use Groq Llama/Mixtral models',
    placeholder: 'gsk_... your Groq API key',
    docsUrl: 'https://console.groq.com/keys'
  }
];