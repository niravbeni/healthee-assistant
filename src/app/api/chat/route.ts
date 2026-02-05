import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { getSystemPrompt, formatConversationHistory, getInitialGreetingPrompt } from '@/lib/prompts';
import { ChatRequest, ChatResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest & { stream?: boolean } = await request.json();
    const { 
      message, 
      assistantType, 
      conversationHistory, 
      bondLevel, 
      onboardingAnswers,
      isInitialGreeting,
      stream = false,
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

    // Streaming response
    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: MODELS.chat,
        messages,
        stream: true,
      });

      // Create a readable stream
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Non-streaming response (default)
    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      messages,
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
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Return error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      message: `I'm having a moment... (${errorMessage})`,
    } as ChatResponse);
  }
}
