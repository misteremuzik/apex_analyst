import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AEOAnalysis {
  structuredDataScore: number;
  snippetOptScore: number;
  crawlabilityScore: number;
  featuredSnippetScore: number;
  contentQualityScore: number;
  technicalSeoScore: number;
  schemasFound: string[];
  issues: string[];
  aiModelAccess: { accessible: number; total: number };
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

    const { url, analysisId } = await req.json();

    if (!url || !analysisId) {
      return new Response(
        JSON.stringify({ error: 'URL and analysisId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let htmlContent = '';
    let fetchError = null;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AEO-Analyzer/1.0'
        }
      });
      if (response.ok) {
        htmlContent = await response.text();
      } else {
        fetchError = `Failed to fetch: ${response.status}`;
      }
    } catch (error) {
      fetchError = error.message;
    }

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aeoAnalysis = performAEOAnalysis(htmlContent, url);
    const overallScore = calculateOverallAEOScore(aeoAnalysis);

    await supabase
      .from('website_analyses')
      .update({
        aeo_overall_score: overallScore,
        structured_data_score: aeoAnalysis.structuredDataScore,
        snippet_optimization_score: aeoAnalysis.snippetOptScore,
        crawlability_score: aeoAnalysis.crawlabilityScore,
        featured_snippet_ready_score: aeoAnalysis.featuredSnippetScore,
        content_quality_score: aeoAnalysis.contentQualityScore,
        technical_seo_score: aeoAnalysis.technicalSeoScore,
        pages_analyzed: 1,
        aeo_schemas_count: aeoAnalysis.schemasFound.length,
        total_issues: aeoAnalysis.issues.length,
        ai_model_access: `${aeoAnalysis.aiModelAccess.accessible}/${aeoAnalysis.aiModelAccess.total}`,
        visibility_metrics: {
          schemas: aeoAnalysis.schemasFound,
          issues: aeoAnalysis.issues,
          aiAccessibility: aeoAnalysis.aiModelAccess
        }
      })
      .eq('id', analysisId);

    return new Response(
      JSON.stringify({ success: true, aeoScore: overallScore }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function performAEOAnalysis(html: string, url: string): AEOAnalysis {
  const schemasFound: string[] = [];
  const issues: string[] = [];

  const structuredDataScore = analyzeAEOStructuredData(html, schemasFound, issues);
  const snippetOptScore = analyzeSnippetOptimization(html, issues);
  const crawlabilityScore = analyzeCrawlability(html, url, issues);
  const featuredSnippetScore = analyzeFeaturedSnippetReadiness(html, issues);
  const contentQualityScore = analyzeAEOContentQuality(html, issues);
  const technicalSeoScore = analyzeAEOTechnicalSEO(html, url, issues);

  const aiModelAccess = determineAIModelAccess({
    structuredDataScore,
    crawlabilityScore,
    technicalSeoScore
  });

  return {
    structuredDataScore,
    snippetOptScore,
    crawlabilityScore,
    featuredSnippetScore,
    contentQualityScore,
    technicalSeoScore,
    schemasFound,
    issues,
    aiModelAccess
  };
}

function analyzeAEOStructuredData(html: string, schemas: string[], issues: string[]): number {
  let score = 0;

  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches && jsonLdMatches.length > 0) {
    score += 3;
    jsonLdMatches.forEach(match => {
      try {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        const data = JSON.parse(jsonContent);
        if (data['@type']) {
          schemas.push(data['@type']);
        }
      } catch (e) {
        // Invalid JSON
      }
    });
  } else {
    score += 0;
    issues.push('Missing Schema.org structured data (JSON-LD)');
  }

  const hasBreadcrumb = html.match(/"@type"\s*:\s*"BreadcrumbList"/i);
  if (hasBreadcrumb) {
    score += 2;
  } else {
    issues.push('No breadcrumb schema found');
  }

  const hasFAQ = html.match(/"@type"\s*:\s*"FAQPage"/i);
  if (hasFAQ) {
    score += 2;
  }

  const hasArticle = html.match(/"@type"\s*:\s*"(Article|BlogPosting|NewsArticle)"/i);
  if (hasArticle) {
    score += 2;
  }

  const hasOrg = html.match(/"@type"\s*:\s*"Organization"/i);
  if (hasOrg) {
    score += 1;
  }

  return Math.min(score, 10);
}

function analyzeSnippetOptimization(html: string, issues: string[]): number {
  let score = 0;

  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (metaDesc && metaDesc[1]) {
    const descLength = metaDesc[1].length;
    if (descLength >= 120 && descLength <= 160) {
      score += 3;
    } else if (descLength > 0) {
      score += 1;
      issues.push('Meta description length not optimal (should be 120-160 characters)');
    }
  } else {
    issues.push('Missing meta description');
  }

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleTag && titleTag[1]) {
    const titleLength = titleTag[1].trim().length;
    if (titleLength >= 30 && titleLength <= 60) {
      score += 3;
    } else if (titleLength > 0) {
      score += 1;
      issues.push('Title tag length not optimal (should be 30-60 characters)');
    }
  } else {
    issues.push('Missing title tag');
  }

  const questionHeadings = html.match(/<h[2-3][^>]*>(what|why|how|when|where|who)[^<]*\?<\/h[2-3]>/gi);
  if (questionHeadings && questionHeadings.length > 0) {
    score += 2;
  }

  const lists = html.match(/<(ul|ol)[^>]*>/gi);
  if (lists && lists.length >= 2) {
    score += 2;
  } else if (lists && lists.length > 0) {
    score += 1;
  }

  return Math.min(score, 10);
}

function analyzeCrawlability(html: string, url: string, issues: string[]): number {
  let score = 10;

  const robotsMetaBlock = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (robotsMetaBlock && robotsMetaBlock[1]) {
    const robotsContent = robotsMetaBlock[1].toLowerCase();
    if (robotsContent.includes('noindex') || robotsContent.includes('nofollow')) {
      score -= 5;
      issues.push('Robots meta tag blocking indexing');
    }
  }

  const hasSitemapLink = html.match(/sitemap\.xml/i);
  if (!hasSitemapLink) {
    score -= 1;
    issues.push('No sitemap reference found');
  }

  const hasCanonical = html.match(/<link[^>]*rel=["']canonical["']/i);
  if (!hasCanonical) {
    score -= 2;
    issues.push('Missing canonical URL');
  }

  if (!url.startsWith('https://')) {
    score -= 2;
    issues.push('Not using HTTPS');
  }

  return Math.max(score, 0);
}

function analyzeFeaturedSnippetReadiness(html: string, issues: string[]): number {
  let score = 0;

  const paragraphs = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
  let hasOptimalParagraph = false;
  if (paragraphs) {
    paragraphs.forEach(p => {
      const text = p.replace(/<[^>]*>/g, '').trim();
      const wordCount = text.split(/\s+/).length;
      if (wordCount >= 40 && wordCount <= 60) {
        hasOptimalParagraph = true;
      }
    });
  }
  if (hasOptimalParagraph) {
    score += 3;
  } else {
    issues.push('No concise answer paragraphs (40-60 words) for featured snippets');
  }

  const tables = html.match(/<table[^>]*>/gi);
  if (tables && tables.length > 0) {
    score += 2;
  }

  const definitionLists = html.match(/<dl[^>]*>/gi);
  if (definitionLists && definitionLists.length > 0) {
    score += 2;
  }

  const orderedLists = html.match(/<ol[^>]*>/gi);
  if (orderedLists && orderedLists.length > 0) {
    score += 2;
  }

  const questionHeadings = html.match(/<h[2-4][^>]*>[^<]*(what|why|how|when|where|who)[^<]*\?[^<]*<\/h[2-4]>/gi);
  if (questionHeadings && questionHeadings.length > 0) {
    score += 1;
  }

  return Math.min(score, 10);
}

function analyzeAEOContentQuality(html: string, issues: string[]): number {
  let score = 0;

  const h1Tags = html.match(/<h1[^>]*>/gi);
  if (h1Tags && h1Tags.length === 1) {
    score += 2;
  } else if (!h1Tags || h1Tags.length === 0) {
    issues.push('Missing H1 heading');
  } else {
    issues.push('Multiple H1 headings found');
  }

  const h2Tags = html.match(/<h2[^>]*>/gi);
  const h3Tags = html.match(/<h3[^>]*>/gi);
  if (h2Tags && h2Tags.length >= 2) {
    score += 2;
  }
  if (h3Tags && h3Tags.length >= 1) {
    score += 1;
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const textContent = bodyContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(/\s+/).length;

  if (wordCount >= 1000) {
    score += 3;
  } else if (wordCount >= 500) {
    score += 2;
  } else if (wordCount >= 300) {
    score += 1;
  } else {
    issues.push('Thin content - needs more comprehensive information');
  }

  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = html.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || [];
  if (images.length > 0 && imagesWithAlt.length / images.length >= 0.8) {
    score += 2;
  } else if (images.length > 0) {
    issues.push('Images missing descriptive alt text');
  }

  return Math.min(score, 10);
}

function analyzeAEOTechnicalSEO(html: string, url: string, issues: string[]): number {
  let score = 0;

  if (url.startsWith('https://')) {
    score += 2;
  } else {
    issues.push('Not using HTTPS');
  }

  const viewport = html.match(/<meta[^>]*name=["']viewport["']/i);
  if (viewport) {
    score += 2;
  } else {
    issues.push('Missing viewport meta tag');
  }

  const lazyLoad = html.match(/loading=["']lazy["']/i);
  const asyncScripts = html.match(/<script[^>]*async/gi);
  if (lazyLoad) {
    score += 1;
  }
  if (asyncScripts && asyncScripts.length > 0) {
    score += 1;
  }

  const hasSitemap = html.match(/sitemap\.xml/i);
  if (hasSitemap) {
    score += 1;
  }

  const hreflang = html.match(/<link[^>]*hreflang=/i);
  if (hreflang) {
    score += 1;
  }

  const ogTags = html.match(/<meta[^>]*property=["']og:/gi);
  if (ogTags && ogTags.length >= 4) {
    score += 2;
  } else if (ogTags && ogTags.length > 0) {
    score += 1;
  } else {
    issues.push('Missing Open Graph tags');
  }

  return Math.min(score, 10);
}

function determineAIModelAccess(scores: { structuredDataScore: number; crawlabilityScore: number; technicalSeoScore: number }) {
  let accessible = 0;
  const total = 3;

  if (scores.crawlabilityScore >= 7) {
    accessible++;
  }

  if (scores.structuredDataScore >= 5 && scores.crawlabilityScore >= 7) {
    accessible++;
  }

  if (scores.structuredDataScore >= 7 && scores.crawlabilityScore >= 8 && scores.technicalSeoScore >= 7) {
    accessible++;
  }

  return { accessible, total };
}

function calculateOverallAEOScore(analysis: AEOAnalysis): number {
  const weights = {
    structuredData: 0.25,
    snippetOpt: 0.15,
    crawlability: 0.20,
    featuredSnippet: 0.10,
    contentQuality: 0.20,
    technicalSeo: 0.10
  };

  const weightedScore = (
    analysis.structuredDataScore * weights.structuredData +
    analysis.snippetOptScore * weights.snippetOpt +
    analysis.crawlabilityScore * weights.crawlability +
    analysis.featuredSnippetScore * weights.featuredSnippet +
    analysis.contentQualityScore * weights.contentQuality +
    analysis.technicalSeoScore * weights.technicalSeo
  ) * 10;

  return Math.round(weightedScore * 100) / 100;
}