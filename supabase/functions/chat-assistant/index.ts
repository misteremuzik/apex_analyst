import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Source {
  title: string;
  url: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_KEY') ?? '',
    });

    const { message, analysisId } = await req.json();

    if (!message || !analysisId) {
      return new Response(
        JSON.stringify({ error: 'Message and analysisId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the analysis details
    const { data: analysis, error: analysisError } = await supabase
      .from('website_analyses')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();

    if (analysisError || !analysis) {
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Store user message
    await supabase
      .from('chat_messages')
      .insert({
        analysis_id: analysisId,
        role: 'user',
        content: message,
      });

    // Build context for Claude
    const systemPrompt = buildSystemPrompt(analysis);
    const conversationHistory = history || [];

    // Call Claude API with Sonnet 4.5
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...conversationHistory.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const responseText = claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : 'I apologize, but I could not generate a response.';

    // Generate relevant sources based on the question
    const sources = generateSources(message, analysis);

    // Store assistant response
    await supabase
      .from('chat_messages')
      .insert({
        analysis_id: analysisId,
        role: 'assistant',
        content: responseText,
        sources,
      });

    return new Response(
      JSON.stringify({ response: responseText, sources }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSystemPrompt(analysis: any): string {
  return `You are an expert AI readiness consultant helping website owners improve their site's compatibility with AI search engines and crawlers.

The user has just analyzed their website and received the following scores:

**Overall Score:** ${analysis.overall_score}/100

**Individual Scores:**
- Structured Data: ${analysis.structured_data_score}/100
- Mobile-Friendly: ${analysis.mobile_friendly_score}/100
- Accessibility: ${analysis.accessibility_score}/100
- Content Quality: ${analysis.content_quality_score}/100
- Technical SEO: ${analysis.technical_seo_score}/100
- Privacy Compliance: ${analysis.privacy_score}/100

**Analysis Details:**
${JSON.stringify({
  structured_data: analysis.structured_data_details,
  mobile_friendly: analysis.mobile_friendly_details,
  accessibility: analysis.accessibility_details,
  content_quality: analysis.content_quality_details,
  technical_seo: analysis.technical_seo_details,
  privacy: analysis.privacy_details,
}, null, 2)}

**Recommendations:**
${analysis.recommendations?.map((r: any, i: number) => 
  `${i + 1}. [${r.priority.toUpperCase()}] ${r.category}: ${r.message}`
).join('\n') || 'No recommendations available.'}

Your role is to:
1. Answer questions about their analysis results
2. Provide actionable advice on improving their scores
3. Explain technical concepts in clear, accessible language
4. Prioritize recommendations based on impact
5. Be encouraging and supportive while being honest about issues
6. Keep responses concise and focused (2-4 paragraphs max)
7. Use bullet points and numbered lists for clarity

Be conversational, helpful, and specific. Reference the actual scores and details when relevant. Focus on practical, actionable guidance.`;
}

function generateSources(message: string, analysis: any): Source[] {
  const lowerMessage = message.toLowerCase();
  const sources: Source[] = [];

  if (lowerMessage.includes('structured data') || lowerMessage.includes('schema') || lowerMessage.includes('json-ld')) {
    sources.push(
      {
        title: 'Schema.org - Getting Started',
        url: 'https://schema.org/docs/gs.html',
        description: 'Official guide to implementing structured data with Schema.org vocabulary',
      },
      {
        title: 'Google Structured Data Guide',
        url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
        description: 'Comprehensive guide from Google on structured data for search',
      },
      {
        title: 'JSON-LD Playground',
        url: 'https://json-ld.org/playground/',
        description: 'Test and validate your JSON-LD structured data',
      }
    );
  }

  if (lowerMessage.includes('mobile') || lowerMessage.includes('responsive') || lowerMessage.includes('viewport')) {
    sources.push(
      {
        title: 'MDN - Responsive Design',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design',
        description: 'Complete guide to building responsive websites',
      },
      {
        title: 'Google Mobile-Friendly Test',
        url: 'https://search.google.com/test/mobile-friendly',
        description: 'Test your site for mobile compatibility',
      },
      {
        title: 'Web.dev - Responsive Images',
        url: 'https://web.dev/learn/design/responsive-images/',
        description: 'Learn to implement responsive images with srcset',
      }
    );
  }

  if (lowerMessage.includes('accessibility') || lowerMessage.includes('alt text') || lowerMessage.includes('aria') || lowerMessage.includes('a11y')) {
    sources.push(
      {
        title: 'WebAIM - Web Accessibility Guide',
        url: 'https://webaim.org/intro/',
        description: 'Comprehensive introduction to web accessibility',
      },
      {
        title: 'WCAG Guidelines',
        url: 'https://www.w3.org/WAI/WCAG21/quickref/',
        description: 'Official Web Content Accessibility Guidelines quick reference',
      },
      {
        title: 'A11y Project Checklist',
        url: 'https://www.a11yproject.com/checklist/',
        description: 'Practical accessibility implementation checklist',
      }
    );
  }

  if (lowerMessage.includes('content') || lowerMessage.includes('heading') || lowerMessage.includes('h1')) {
    sources.push(
      {
        title: 'Moz - On-Page SEO',
        url: 'https://moz.com/learn/seo/on-page-factors',
        description: 'Guide to on-page SEO and content optimization',
      },
      {
        title: 'Google Search Central - Content Guidelines',
        url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        description: 'Creating helpful, reliable, people-first content',
      }
    );
  }

  if (lowerMessage.includes('seo') || lowerMessage.includes('technical') || lowerMessage.includes('https') || lowerMessage.includes('meta')) {
    sources.push(
      {
        title: 'Google Search Central',
        url: 'https://developers.google.com/search/docs',
        description: 'Official Google documentation for search optimization',
      },
      {
        title: 'Moz - Technical SEO Guide',
        url: 'https://moz.com/learn/seo/technical-seo',
        description: 'Comprehensive technical SEO best practices',
      },
      {
        title: 'Web.dev - Core Web Vitals',
        url: 'https://web.dev/vitals/',
        description: 'Essential metrics for site health and performance',
      }
    );
  }

  if (lowerMessage.includes('privacy') || lowerMessage.includes('gdpr') || lowerMessage.includes('cookie')) {
    sources.push(
      {
        title: 'GDPR Official Site',
        url: 'https://gdpr.eu/',
        description: 'Complete guide to GDPR compliance',
      },
      {
        title: 'Cookie Consent Best Practices',
        url: 'https://www.cookiebot.com/en/gdpr-cookies/',
        description: 'Understanding cookie consent requirements',
      }
    );
  }

  // Default sources if no specific topic matched
  if (sources.length === 0) {
    sources.push(
      {
        title: 'Web.dev - Learn Web Development',
        url: 'https://web.dev/learn/',
        description: 'Comprehensive courses on modern web development',
      },
      {
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/',
        description: 'Comprehensive web development documentation',
      }
    );
  }

  return sources;
}