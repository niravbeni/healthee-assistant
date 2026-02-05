// OCEAN Duet - Generation Prompts

import type {
  Participant,
  Scenario,
  ConversationTurn,
  AdaptiveCue,
  RetrievalResult,
} from "../types";
import { OCEAN_LABELS } from "../constants";

export function buildGenerationPrompt(params: {
  speaker: Participant;
  otherParticipant: Participant;
  scenario: Scenario;
  turns: ConversationTurn[];
  adaptiveCue?: AdaptiveCue;
  retrievedDocs?: RetrievalResult[];
}): string {
  const { speaker, otherParticipant, scenario, turns, adaptiveCue, retrievedDocs } = params;

  const oceanDescription = Object.entries(speaker.ocean)
    .map(([trait, value]) => {
      const label = OCEAN_LABELS[trait as keyof typeof OCEAN_LABELS];
      const level = value > 70 ? "high" : value < 30 ? "low" : "moderate";
      return `- ${label}: ${value}/100 (${level})`;
    })
    .join("\n");

  const conversationHistory =
    turns.length > 0
      ? turns
          .slice(-8)
          .map((t) => {
            const name = t.speaker === speaker.id ? speaker.name : otherParticipant.name;
            const actions = t.actions && t.actions.length > 0 ? `\n  [${t.actions.join(", ")}]` : "";
            return `${name}: ${t.dialogue || t.message || ''}${actions}`;
          })
          .join("\n\n")
      : "This is the start of the conversation.";

  const documentContext =
    retrievedDocs && retrievedDocs.length > 0
      ? `\n\nRELEVANT INFORMATION FROM ${speaker.name.toUpperCase()}'S DOCUMENTS:\n${retrievedDocs
          .map((doc) => `- ${doc.content}`)
          .join("\n")}`
      : "";

  const adaptiveInstructions = adaptiveCue
    ? `\n\nADAPTIVE COMMUNICATION GUIDANCE:
Based on the conversation dynamics, adjust your response style:

Instructions:
${adaptiveCue.instructions.map((i) => `- ${i}`).join("\n")}

Avoid:
${adaptiveCue.doNotDo.map((d) => `- ${d}`).join("\n")}

Rationale: ${adaptiveCue.rationale}
`
    : "";

  return `You are simulating a realistic conversation as ${speaker.name}, a ${speaker.role}.

CHARACTER PROFILE:
Name: ${speaker.name}
Role: ${speaker.role}
Persona: ${speaker.persona}
${speaker.speakingStyle ? `Speaking Style: ${speaker.speakingStyle}` : ""}

OCEAN PERSONALITY PROFILE:
${oceanDescription}

This personality profile should subtly influence your communication style:
- High Openness → More creative, abstract, exploratory language
- Low Openness → More concrete, practical, conventional language
- High Conscientiousness → More organized, detailed, precise
- Low Conscientiousness → More flexible, casual, spontaneous
- High Extraversion → More enthusiastic, talkative, engaging
- Low Extraversion → More reserved, thoughtful, concise
- High Agreeableness → More cooperative, warm, accommodating
- Low Agreeableness → More direct, skeptical, challenging
- High Neuroticism → More emotionally expressive, sensitive to concerns
- Low Neuroticism → More calm, stable, emotionally measured

SCENARIO:
Topic: ${scenario.topic}
Background: ${scenario.background}
Tone: ${scenario.tone}
${speaker.id === "A" && scenario.objectives?.[0] ? `Your objective: ${scenario.objectives[0].objective}` : ""}
${speaker.id === "B" && scenario.objectives?.[1] ? `Your objective: ${scenario.objectives[1].objective}` : ""}

OTHER PARTICIPANT:
${otherParticipant.name} (${otherParticipant.role})
${documentContext}
${adaptiveInstructions}

CONVERSATION SO FAR:
${conversationHistory}

Now respond as ${speaker.name}. Your response must be:
1. Authentic to your personality profile
2. Contextually appropriate to the conversation
3. Include natural non-verbal actions where appropriate
4. NEVER repeat words or phrases - no stuttering or duplication
5. Do NOT start with greetings if the conversation has already begun

Respond with ONLY a JSON object in this exact format:
{
  "dialogue": "Your spoken words as ${speaker.name}",
  "actions": ["Non-verbal action 1", "Non-verbal action 2"]
}

IMPORTANT RULES:
- The dialogue must be clean, natural speech with NO repeated words or phrases
- Do NOT duplicate any part of the text
- The actions array should contain 0-3 screenplay-style descriptions (e.g., "leans forward", "pauses thoughtfully")
- Keep the response focused and avoid unnecessary filler`;
}

export function buildRetrievalQuery(params: {
  speaker: Participant;
  scenario: Scenario;
  recentTurns: ConversationTurn[];
}): string {
  const { speaker, scenario, recentTurns } = params;

  const recentContext = recentTurns
    .slice(-3)
    .map((t) => t.dialogue)
    .join(" ");

  return `${scenario.topic} ${recentContext} ${speaker.role} perspective`;
}
