# Healthee - AI Pet Health Companion

A voice-first healthcare companion presented as a full-screen digital pet. Healthee creates emotional safety around preventative healthcare through simulated care coordination, reminders, and reassurance.

## Features

- **Two Pet Personalities**: Based on your onboarding responses, you'll be matched with either:
  - **Krea** - A calm, proactive care coordinator (3D animated purple orb) that handles the mental load
  - **Bonobo** - A warm, reciprocal companion (green character) that you care for and who cares back

- **Voice-First Interaction**: Push-to-talk voice interface with natural conversation (spacebar supported)
- **Animated Pets**: 3D WebGL blob for Krea, animated image with dynamic mouth for Bonobo
- **OCEAN Duet Integration**: Built-in personality simulation tool
- **Click/Pet Interactions**: Click and drag to interact with your pet (especially Bonobo!)
- **Local-Only Storage**: All data stays on your device in localStorage
- **Simulated Healthcare Actions**: Pet "schedules" and "reminds" without real automation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-5.2, Whisper, TTS
- **3D Graphics**: Three.js, React Three Fiber, custom GLSL shaders
- **Animation**: WebGL for Krea, CSS animations for Bonobo

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd healthee
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the `OPENAI_API_KEY` environment variable in the Vercel dashboard
4. Deploy!

The app is configured to work with Vercel out of the box.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Entry point (redirects based on state)
│   ├── onboarding/           # 5-question onboarding flow
│   ├── pet/                  # Main pet interface
│   └── api/                  # API routes for OpenAI
│       ├── classify/         # GPT classification
│       ├── chat/             # Conversation
│       ├── transcribe/       # Whisper transcription
│       └── tts/              # Text-to-speech
├── components/
│   ├── pet/                  # Pet canvas components
│   ├── voice/                # Mic button
│   ├── onboarding/           # Question cards
│   └── ui/                   # Common UI components
├── hooks/                    # React hooks
├── lib/                      # Utilities and configs
└── types/                    # TypeScript types
```

## Usage

1. **Onboarding**: Answer 5 reflective questions about your health journey
2. **Meet Your Pet**: Based on your answers, you'll be matched with Krea or Bonobo
3. **Interact**: Hold the mic button to speak, click/drag the pet to interact
4. **Converse**: Discuss health topics - your pet will simulate scheduling and reminders

## Important Notes

- **This is not medical advice**: Healthee is a wellness companion, not a healthcare provider
- **Simulated Actions**: When the pet says "I'll schedule that," it's emotional support, not real automation
- **Privacy**: All data is stored locally. Only voice/text is sent to OpenAI for processing

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT
