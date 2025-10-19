import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  url: string;
  analysisId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { url, analysisId }: RequestBody = await req.json();

    if (!url || !analysisId) {
      return new Response(
        JSON.stringify({ error: "Missing url or analysisId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Analyzing performance for: ${url}`);

    const googleApiKey = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
    
    if (!googleApiKey) {
      console.error("GOOGLE_PAGESPEED_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "Google PageSpeed API key is not configured. Please contact support."
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&key=${googleApiKey}`;

    console.log('Fetching PageSpeed Insights data...');
    const pageSpeedResponse = await fetch(pageSpeedUrl);

    if (!pageSpeedResponse.ok) {
      const errorText = await pageSpeedResponse.text();
      console.error('PageSpeed API error:', errorText);
      throw new Error(`PageSpeed API error: ${pageSpeedResponse.status} - ${errorText}`);
    }

    const data = await pageSpeedResponse.json();

    if (!data.lighthouseResult) {
      throw new Error('Invalid response from PageSpeed API: missing lighthouseResult');
    }

    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;

    const performanceScore = Math.round((categories.performance?.score || 0) * 100);
    const accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
    const bestPracticesScore = Math.round((categories["best-practices"]?.score || 0) * 100);
    const seoScore = Math.round((categories.seo?.score || 0) * 100);

    const performanceMetrics = {
      fcp: {
        value: audits["first-contentful-paint"]?.numericValue || 0,
        score: Math.round((audits["first-contentful-paint"]?.score || 0) * 100),
        displayValue: audits["first-contentful-paint"]?.displayValue || "N/A",
      },
      lcp: {
        value: audits["largest-contentful-paint"]?.numericValue || 0,
        score: Math.round((audits["largest-contentful-paint"]?.score || 0) * 100),
        displayValue: audits["largest-contentful-paint"]?.displayValue || "N/A",
      },
      tbt: {
        value: audits["total-blocking-time"]?.numericValue || 0,
        score: Math.round((audits["total-blocking-time"]?.score || 0) * 100),
        displayValue: audits["total-blocking-time"]?.displayValue || "N/A",
      },
      cls: {
        value: audits["cumulative-layout-shift"]?.numericValue || 0,
        score: Math.round((audits["cumulative-layout-shift"]?.score || 0) * 100),
        displayValue: audits["cumulative-layout-shift"]?.displayValue || "N/A",
      },
      speedIndex: {
        value: audits["speed-index"]?.numericValue || 0,
        score: Math.round((audits["speed-index"]?.score || 0) * 100),
        displayValue: audits["speed-index"]?.displayValue || "N/A",
      },
      tti: {
        value: audits["interactive"]?.numericValue || 0,
        score: Math.round((audits["interactive"]?.score || 0) * 100),
        displayValue: audits["interactive"]?.displayValue || "N/A",
      },
      categories: {
        performance: performanceScore,
        accessibility: accessibilityScore,
        bestPractices: bestPracticesScore,
        seo: seoScore,
      },
      loadingExperience: data.loadingExperience || {},
      originLoadingExperience: data.originLoadingExperience || {},
    };

    console.log('Updating database with performance metrics...');
    const { error: updateError } = await supabase
      .from("website_analyses")
      .update({
        performance_score: performanceScore,
        seo_score: seoScore,
        best_practices_score: bestPracticesScore,
        performance_metrics: performanceMetrics,
        performance_analyzed_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Performance analysis completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        performanceScore,
        seoScore,
        bestPracticesScore,
        performanceMetrics,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing performance:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});