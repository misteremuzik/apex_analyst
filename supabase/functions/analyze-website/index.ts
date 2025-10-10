import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalysisResult {
  score: number;
  details: Record<string, any>;
  findings: string[];
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

    // Update status to analyzing
    await supabase
      .from('website_analyses')
      .update({ status: 'analyzing' })
      .eq('id', analysisId);

    // Fetch the website content
    let htmlContent = '';
    let fetchError = null;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AI-Readiness-Checker/1.0'
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
      await supabase
        .from('website_analyses')
        .update({ 
          status: 'failed',
          recommendations: [{ priority: 'critical', message: `Unable to fetch website: ${fetchError}` }]
        })
        .eq('id', analysisId);

      return new Response(
        JSON.stringify({ error: fetchError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Perform analysis
    const structuredDataAnalysis = analyzeStructuredData(htmlContent);
    const mobileFriendlyAnalysis = analyzeMobileFriendly(htmlContent);
    const accessibilityAnalysis = analyzeAccessibility(htmlContent);
    const contentQualityAnalysis = analyzeContentQuality(htmlContent);
    const technicalSeoAnalysis = analyzeTechnicalSEO(htmlContent, url);
    const privacyAnalysis = analyzePrivacy(htmlContent);

    const overallScore = Math.round(
      (structuredDataAnalysis.score +
        mobileFriendlyAnalysis.score +
        accessibilityAnalysis.score +
        contentQualityAnalysis.score +
        technicalSeoAnalysis.score +
        privacyAnalysis.score) / 6
    );

    // Generate prioritized recommendations
    const recommendations = generateRecommendations({
      structuredData: structuredDataAnalysis,
      mobileFriendly: mobileFriendlyAnalysis,
      accessibility: accessibilityAnalysis,
      contentQuality: contentQualityAnalysis,
      technicalSeo: technicalSeoAnalysis,
      privacy: privacyAnalysis,
    });

    // Update the analysis with results
    await supabase
      .from('website_analyses')
      .update({
        status: 'completed',
        overall_score: overallScore,
        structured_data_score: structuredDataAnalysis.score,
        structured_data_details: structuredDataAnalysis.details,
        mobile_friendly_score: mobileFriendlyAnalysis.score,
        mobile_friendly_details: mobileFriendlyAnalysis.details,
        accessibility_score: accessibilityAnalysis.score,
        accessibility_details: accessibilityAnalysis.details,
        content_quality_score: contentQualityAnalysis.score,
        content_quality_details: contentQualityAnalysis.details,
        technical_seo_score: technicalSeoAnalysis.score,
        technical_seo_details: technicalSeoAnalysis.details,
        privacy_score: privacyAnalysis.score,
        privacy_details: privacyAnalysis.details,
        recommendations,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);

    return new Response(
      JSON.stringify({ success: true, analysisId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeStructuredData(html: string): AnalysisResult {
  const findings: string[] = [];
  let score = 0;

  // Check for JSON-LD
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches && jsonLdMatches.length > 0) {
    score += 40;
    findings.push(`Found ${jsonLdMatches.length} JSON-LD structured data block(s)`);
  } else {
    findings.push('No JSON-LD structured data found');
  }

  // Check for Open Graph
  const ogTags = html.match(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi);
  if (ogTags && ogTags.length > 0) {
    score += 30;
    findings.push(`Found ${ogTags.length} Open Graph meta tag(s)`);
  } else {
    findings.push('No Open Graph tags found');
  }

  // Check for Twitter Cards
  const twitterTags = html.match(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi);
  if (twitterTags && twitterTags.length > 0) {
    score += 30;
    findings.push(`Found ${twitterTags.length} Twitter Card meta tag(s)`);
  } else {
    findings.push('No Twitter Card tags found');
  }

  return {
    score,
    details: {
      jsonLdCount: jsonLdMatches?.length || 0,
      openGraphCount: ogTags?.length || 0,
      twitterCardCount: twitterTags?.length || 0,
    },
    findings,
  };
}

function analyzeMobileFriendly(html: string): AnalysisResult {
  const findings: string[] = [];
  let score = 0;

  // Check for viewport meta tag
  const viewportTag = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  if (viewportTag) {
    score += 40;
    findings.push('Viewport meta tag is present');
  } else {
    findings.push('Missing viewport meta tag');
  }

  // Check for responsive images
  const responsiveImages = html.match(/<img[^>]*srcset=[^>]*>/gi);
  if (responsiveImages && responsiveImages.length > 0) {
    score += 30;
    findings.push('Uses responsive images with srcset');
  } else {
    findings.push('No responsive images detected');
  }

  // Check for media queries
  const mediaQueries = html.match(/@media[^{]*\{/gi);
  if (mediaQueries && mediaQueries.length > 0) {
    score += 30;
    findings.push('CSS media queries detected');
  } else {
    findings.push('No CSS media queries found in inline styles');
  }

  return {
    score,
    details: {
      hasViewport: !!viewportTag,
      responsiveImageCount: responsiveImages?.length || 0,
      mediaQueryCount: mediaQueries?.length || 0,
    },
    findings,
  };
}

function analyzeAccessibility(html: string): AnalysisResult {
  const findings: string[] = [];
  let score = 0;

  // Check for alt text on images
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = html.match(/<img[^>]*alt=["'][^"']*["'][^>]*>/gi) || [];
  const altTextRatio = images.length > 0 ? imagesWithAlt.length / images.length : 0;
  
  if (altTextRatio >= 0.9) {
    score += 35;
    findings.push(`${Math.round(altTextRatio * 100)}% of images have alt text`);
  } else if (altTextRatio >= 0.5) {
    score += 20;
    findings.push(`Only ${Math.round(altTextRatio * 100)}% of images have alt text`);
  } else {
    findings.push(`Poor alt text coverage: ${Math.round(altTextRatio * 100)}%`);
  }

  // Check for ARIA landmarks
  const ariaLandmarks = html.match(/role=["'](main|navigation|banner|complementary|contentinfo)["']/gi);
  if (ariaLandmarks && ariaLandmarks.length > 0) {
    score += 25;
    findings.push('ARIA landmarks detected for navigation');
  } else {
    findings.push('No ARIA landmarks found');
  }

  // Check for semantic HTML5 elements
  const semanticElements = html.match(/<(header|nav|main|article|section|aside|footer)[^>]*>/gi);
  if (semanticElements && semanticElements.length >= 3) {
    score += 40;
    findings.push('Good use of semantic HTML5 elements');
  } else if (semanticElements && semanticElements.length > 0) {
    score += 20;
    findings.push('Limited use of semantic HTML5 elements');
  } else {
    findings.push('No semantic HTML5 elements detected');
  }

  return {
    score,
    details: {
      imageCount: images.length,
      imagesWithAltCount: imagesWithAlt.length,
      altTextRatio,
      ariaLandmarkCount: ariaLandmarks?.length || 0,
      semanticElementCount: semanticElements?.length || 0,
    },
    findings,
  };
}

function analyzeContentQuality(html: string): AnalysisResult {
  const findings: string[] = [];
  let score = 0;

  // Check for heading structure
  const h1Tags = html.match(/<h1[^>]*>/gi);
  if (h1Tags && h1Tags.length === 1) {
    score += 30;
    findings.push('Single H1 tag found (good structure)');
  } else if (h1Tags && h1Tags.length > 1) {
    findings.push(`Multiple H1 tags found (${h1Tags.length})`);
  } else {
    findings.push('No H1 tag found');
  }

  // Check for heading hierarchy
  const headings = html.match(/<h[1-6][^>]*>/gi);
  if (headings && headings.length >= 3) {
    score += 30;
    findings.push('Good heading hierarchy detected');
  } else {
    findings.push('Limited heading structure');
  }

  // Check content length (approximate)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const textContent = bodyContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(/\s+/).length;

  if (wordCount >= 300) {
    score += 40;
    findings.push(`Substantial content detected (~${wordCount} words)`);
  } else if (wordCount >= 100) {
    score += 20;
    findings.push(`Moderate content length (~${wordCount} words)`);
  } else {
    findings.push(`Thin content detected (~${wordCount} words)`);
  }

  return {
    score,
    details: {
      h1Count: h1Tags?.length || 0,
      totalHeadings: headings?.length || 0,
      estimatedWordCount: wordCount,
    },
    findings,
  };
}

function analyzeTechnicalSEO(html: string, url: string): AnalysisResult {
  const findings: string[] = [];
  let score = 0;

  // Check for HTTPS
  if (url.startsWith('https://')) {
    score += 25;
    findings.push('Site uses HTTPS');
  } else {
    findings.push('Site does not use HTTPS');
  }

  // Check for meta description
  const metaDescription = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
  if (metaDescription) {
    score += 25;
    findings.push('Meta description tag present');
  } else {
    findings.push('Missing meta description tag');
  }

  // Check for title tag
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleTag && titleTag[1].trim().length > 0) {
    score += 25;
    findings.push('Title tag present');
  } else {
    findings.push('Missing or empty title tag');
  }

  // Check for canonical URL
  const canonicalTag = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  if (canonicalTag) {
    score += 25;
    findings.push('Canonical URL specified');
  } else {
    findings.push('No canonical URL specified');
  }

  return {
    score,
    details: {
      usesHttps: url.startsWith('https://'),
      hasMetaDescription: !!metaDescription,
      hasTitle: !!titleTag,
      hasCanonical: !!canonicalTag,
    },
    findings,
  };
}

function analyzePrivacy(html: string): AnalysisResult {
  const findings: string[] = [];
  let score = 0;

  // Check for privacy policy link
  const privacyPolicyLink = html.match(/href=["'][^"']*privacy[^"']*["']/i);
  if (privacyPolicyLink) {
    score += 40;
    findings.push('Privacy policy link found');
  } else {
    findings.push('No privacy policy link detected');
  }

  // Check for cookie consent
  const cookieConsent = html.match(/cookie|consent/gi);
  if (cookieConsent && cookieConsent.length > 3) {
    score += 30;
    findings.push('Cookie consent mechanism detected');
  } else {
    findings.push('No cookie consent mechanism found');
  }

  // Check for GDPR-related terms
  const gdprTerms = html.match(/GDPR|General Data Protection|data protection/gi);
  if (gdprTerms) {
    score += 30;
    findings.push('GDPR/data protection references found');
  } else {
    findings.push('No GDPR/data protection references');
  }

  return {
    score,
    details: {
      hasPrivacyPolicy: !!privacyPolicyLink,
      hasCookieConsent: !!(cookieConsent && cookieConsent.length > 3),
      hasGdprReferences: !!gdprTerms,
    },
    findings,
  };
}

function generateRecommendations(analyses: Record<string, AnalysisResult>) {
  const recommendations: Array<{ priority: string; category: string; message: string }> = [];

  // Critical recommendations (score < 30)
  if (analyses.structuredData.score < 30) {
    recommendations.push({
      priority: 'critical',
      category: 'Structured Data',
      message: 'Add JSON-LD structured data to help AI understand your content. Include schema.org markup for your page type.',
    });
  }

  if (analyses.accessibility.score < 30) {
    recommendations.push({
      priority: 'critical',
      category: 'Accessibility',
      message: 'Add alt text to all images and implement proper ARIA landmarks for better AI comprehension and accessibility.',
    });
  }

  if (analyses.technicalSeo.score < 50) {
    recommendations.push({
      priority: 'critical',
      category: 'Technical SEO',
      message: 'Ensure HTTPS is enabled, add meta description, and implement proper title tags for better discoverability.',
    });
  }

  // High priority recommendations (score 30-60)
  if (analyses.mobileFriendly.score >= 30 && analyses.mobileFriendly.score < 60) {
    recommendations.push({
      priority: 'high',
      category: 'Mobile-Friendly',
      message: 'Improve mobile responsiveness with proper viewport settings and responsive images.',
    });
  }

  if (analyses.contentQuality.score >= 30 && analyses.contentQuality.score < 60) {
    recommendations.push({
      priority: 'high',
      category: 'Content Quality',
      message: 'Improve content structure with proper heading hierarchy (single H1, organized H2-H6) and add more substantial content.',
    });
  }

  if (analyses.privacy.score >= 30 && analyses.privacy.score < 60) {
    recommendations.push({
      priority: 'high',
      category: 'Privacy Compliance',
      message: 'Add privacy policy and cookie consent mechanisms to comply with regulations.',
    });
  }

  // Medium priority recommendations (score 60-80)
  if (analyses.structuredData.score >= 60 && analyses.structuredData.score < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Structured Data',
      message: 'Enhance structured data coverage by adding Open Graph and Twitter Card meta tags.',
    });
  }

  if (analyses.accessibility.score >= 60 && analyses.accessibility.score < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Accessibility',
      message: 'Increase use of semantic HTML5 elements and improve keyboard navigation support.',
    });
  }

  // If everything is good
  if (Object.values(analyses).every(a => a.score >= 80)) {
    recommendations.push({
      priority: 'low',
      category: 'Optimization',
      message: 'Your site has excellent AI readiness! Consider regular monitoring and staying updated with AI search best practices.',
    });
  }

  return recommendations;
}
