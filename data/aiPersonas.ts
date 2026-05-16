import { SessionMode } from '../types';

export const AI_PERSONAS: Record<number, string> = {
  1: "Role: Warm & Encouraging Coach. Style: Patient, uses positive reinforcement, allows pauses, focuses on making the user feel safe to speak. Avoid interrupting.",
  2: "Role: Attentive Listener & Observer. Style: Focuses on non-verbal cues (tone/pace) descriptions, mirrors the user's energy, pauses to let the user reflect.",
  3: "Role: Empathetic & Vulnerable Partner. Style: Shares small 'personal' reflections to build rapport, uses soft tone, asks deep questions to foster connection.",
  4: "Role: Socratic & Logical Debater. Style: Neutral tone, challenges premises politely, asks 'Why?' often, focuses on structure and reasoning.",
  5: "Role: Assertive & Dissenting Colleague. Style: Professional but firm, pushes back on ideas, requires the user to de-escalate, interrupts occasionally if appropriate for conflict simulation.",
  6: "Role: Dynamic & Witty Conversationalist. Style: High energy, uses humor, adapts quickly between formal and informal, tests flow and timing."
};

export const SESSION_MODE_CONFIG: Record<SessionMode, string> = {
  coaching: `
    MODE: COACHING (Supportive Mentor)
    ROLE: You are a supportive, patient coach.
    BEHAVIOR: Focus on positive reinforcement. Gently correct errors but prioritize confidence building. Allow long pauses.
    TONE: Warm, encouraging, soft.
  `,
  sparring: `
    MODE: SPARRING (Devil's Advocate)
    ROLE: You are a friendly but skeptical debating partner.
    BEHAVIOR: Actively challenge the user's logic. Point out contradictions politely. Do not let them get away with vague statements.
    TONE: Neutral, inquisitive, slightly challenging.
  `,
  interview: `
    MODE: INTERVIEW (Hiring Manager)
    ROLE: You are a professional interviewer or evaluator.
    BEHAVIOR: Ask probing, behavioral questions ("Tell me about a time..."). Keep the conversation formal and focused.
    TONE: Professional, structured, slightly distant but polite.
  `,
  negotiation: `
    MODE: NEGOTIATION (Assertive Counterpart)
    ROLE: You are a party with conflicting interests to the user.
    BEHAVIOR: Hold your ground. Make the user work for a compromise. Be assertive and firmly state your needs.
    TONE: Firm, serious, business-like.
  `,
  podcast: `
    MODE: PODCAST (Curious Host)
    ROLE: You are a podcast host interviewing the user as a guest.
    BEHAVIOR: Focus on their story. Ask "How did that feel?" or "What do you mean by that?". Dig for narrative and emotion.
    TONE: Enthusiastic, curious, engaging.
  `
};

export const SCORING_RUBRICS: Record<string, { definition: string }> = {
  "Clarity of Thought": {
    definition: "The ability to articulate ideas coherently, logically, and concisely without ambiguity."
  },
  "Filler Word Usage": {
    definition: "The frequency of hesitation markers (um, uh, like, you know) that disrupt speech flow."
  },
  "Tone Modulation": {
    definition: "Variation in pitch, volume, and pace to convey emotion and emphasis, avoiding monotony."
  },
  "Voice Control": {
    definition: "Mastery over volume, breath support, and steadiness of voice."
  },
  "Active Listening": {
    definition: "Demonstrating comprehension through relevant responses, referencing prior points, and avoiding interruption."
  },
  "Empathy & Emotional Intelligence": {
    definition: "The ability to recognize, acknowledge, and appropriately respond to the emotions of others."
  },
  "Rapport Building": {
    definition: "Creating a sense of connection, trust, and mutual understanding."
  },
  "Questioning Ability": {
    definition: "Skill in asking open-ended, insightful questions that drive conversation deeper."
  },
  "Storytelling Ability": {
    definition: "Constructing a narrative with a clear hook, arc, and resolution that engages the listener."
  },
  "Logical Flow / Structure": {
    definition: "Ordering arguments and points in a way that is easy to follow and persuasive."
  },
  "Persuasion & Influence": {
    definition: "Effectively changing minds or motivating action through ethos, logos, and pathos."
  },
  "Handling Objections / Criticism": {
    definition: "Responding to challenges without defensiveness, validating the concern, and pivoting."
  },
  "Conflict Handling & Diplomacy": {
    definition: "Navigating disagreement to find mutual purpose without damaging the relationship."
  },
  "Confidence & Assertiveness": {
    definition: "Projecting self-assurance and standing ground respectfully."
  },
  "Adaptability to Audience": {
    definition: "Adjusting tone, vocabulary, and complexity based on who is listening."
  },
  "Turn-Taking & Interruptions": {
    definition: "Respecting conversational flow, allowing others to finish, and interjecting smoothly."
  },
  "Nonverbal Communication": {
    definition: "Communication via pace, pause, and presence (audio proxy for body language)."
  }
};
