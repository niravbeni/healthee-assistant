import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { getSystemPrompt, formatConversationHistory, getInitialGreetingPrompt } from '@/lib/prompts';
import { ChatRequest, ChatResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { 
      message, 
      assistantType, 
      conversationHistory, 
      bondLevel, 
      onboardingAnswers,
      isInitialGreeting 
    } = body;

    if (!assistantType) {
      return NextResponse.json(
        { error: 'Assistant type is required' },
        { status: 400 }
      );
    }

    // Get system prompt based on assistant type
    const systemPrompt = getSystemPrompt(assistantType, bondLevel, onboardingAnswers);

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    const formattedHistory = formatConversationHistory(conversationHistory);
    messages.push(...formattedHistory);

    // Add the current message or initial greeting request
    if (isInitialGreeting) {
      const greetingPrompt = getInitialGreetingPrompt(assistantType, onboardingAnswers);
      messages.push({ role: 'user', content: greetingPrompt });
    } else if (message) {
      messages.push({ role: 'user', content: message });
    } else {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      messages,
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const responseMessage = completion.choices[0]?.message?.content;

    if (!responseMessage) {
      throw new Error('No response from chat');
    }

    const response: ChatResponse = {
      message: responseMessage.trim(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    
    // Return a gentle fallback message
    return NextResponse.json({
      message: "I'm having a moment... give me a second and try again?",
    } as ChatResponse);
  }
}
