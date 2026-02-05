import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';
import { CLASSIFICATION_PROMPT } from '@/lib/prompts';
import { ClassifyRequest, ClassifyResponse, AssistantType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ClassifyRequest = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Easter egg: if any answer ends with "...", automatically select Krea
    const hasEllipsis = answers.some(answer => answer.trim().endsWith('...'));
    if (hasEllipsis) {
      return NextResponse.json({
        assistantType: 'krea',
        confidenceScore: 1.0,
      } as ClassifyResponse);
    }

    // Format the answers for the prompt
    const formattedAnswers = answers
      .map((answer, i) => `Question ${i + 1}: ${answer}`)
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [
        { role: 'system', content: CLASSIFICATION_PROMPT },
        {
          role: 'user',
          content: `Please analyze these onboarding responses and classify the user:\n\n${formattedAnswers}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from classification');
    }

    let result: { assistantType: string; confidenceScore: number };
    
    try {
      result = JSON.parse(content);
    } catch {
      // If parsing fails, default to bonobo
      result = { assistantType: 'bonobo', confidenceScore: 0.5 };
    }

    // Validate and normalize the response
    let assistantType: AssistantType = 'bonobo';
    let confidenceScore = 0.5;

    if (result.assistantType === 'krea' || result.assistantType === 'bonobo') {
      assistantType = result.assistantType;
    }

    if (typeof result.confidenceScore === 'number') {
      confidenceScore = Math.max(0, Math.min(1, result.confidenceScore));
    }

    // If confidence is low, default to bonobo (the gentler option)
    if (confidenceScore < 0.6) {
      assistantType = 'bonobo';
    }

    const response: ClassifyResponse = {
      assistantType,
      confidenceScore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Classification error:', error);
    
    // Return default on error
    return NextResponse.json({
      assistantType: 'bonobo',
      confidenceScore: 0.5,
    } as ClassifyResponse);
  }
}
