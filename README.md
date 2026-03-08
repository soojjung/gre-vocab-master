# GRE Vocab Master

A flashcard app for GRE vocabulary preparation, available on **web** and **iOS**. Master **1,560 essential words** from Manhattan Prep and Target Test Prep using spaced repetition.

[![Download on the App Store](https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg)](https://apps.apple.com/app/id6758345755)

## Who Is This For?

- **GRE test takers**: Study vocabulary systematically with a D-day countdown
- **English learners**: Learn advanced English words with example sentences
- **Busy learners**: Study on the go with the web or iOS app

## How to Use

### 1. Daily Flashcard Study

- Set a daily goal (default: 25 words) and tap "Start Today's Study" on the home screen
- View a word on the flashcard, recall the meaning, then flip to check
- Mark "Know" or "Don't Know" — the spaced repetition algorithm adjusts review intervals accordingly
- Enable auto-pronunciation to hear each word spoken aloud
- New words are shuffled randomly each session to prevent positional memorization

### 2. Quiz Yourself

- **Fill-in-the-blank**: Complete sentences with the correct vocabulary word
- **Multiple choice**: Match English words to their definitions
- Each quiz consists of 20 questions to test your retention

### 3. Review in the Word List

- Search for specific words quickly
- Filter by status: All / Learning / Mastered / Bookmarked
- Bookmark frequently missed words for focused review

### 4. Track Your Progress

- View overall progress and daily study counts
- Maintain your study streak for motivation

## Features

| Feature            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Flashcards         | English word → Korean definition + example sentence   |
| Auto Pronunciation | Consistent English pronunciation via Google Cloud TTS |
| Spaced Repetition  | Missed words appear more often; known words less      |
| Random Order       | New words are shuffled each session                   |
| Quiz Mode          | Fill-in-the-blank and multiple choice quizzes         |
| Word List          | Search, filter, and bookmark words                    |
| Statistics         | Progress tracking, daily counts, weak word analysis   |
| D-day Countdown    | Days remaining until your target test date            |
| iOS App            | Available on the App Store                            |
| My Page            | Study settings, contact, developer note, license      |

## Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router DOM** - Routing

### Backend & Auth

- **Supabase** - Authentication & PostgreSQL database
- **Vercel Serverless Functions** - TTS API proxy
- **Google Cloud TTS** - English pronunciation synthesis

### UI/UX

- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Mobile

- **Capacitor** - iOS native app wrapper

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd GRE

# Set Node version
nvm use

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google Cloud TTS (set as Vercel environment variable)
GOOGLE_TTS_API_KEY=
```

### Build

```bash
# Production build
npm run build

# Preview the build
npm run preview
```

### Other Scripts

```bash
# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Lint + format
npm run fix
```

## Project Structure

```
├── api/             # Vercel Serverless Functions
│   └── tts.ts       # Google Cloud TTS proxy
└── src/
    ├── components/  # Reusable components
    ├── contexts/    # React Context (Auth, Quiz)
    ├── data/        # Word data (1,560 words)
    ├── hooks/       # Custom hooks
    ├── lib/         # Supabase config, date utilities
    ├── pages/       # Page components
    └── types.ts     # TypeScript type definitions
```

## License

This project was created for personal learning purposes.

Word data sources:

- [Manhattan Prep 1000 GRE Words](https://www.manhattanprep.com/gre/)
- [Target Test Prep GRE Vocabulary](https://gre.blog.targettestprep.com/gre-vocabulary/)
