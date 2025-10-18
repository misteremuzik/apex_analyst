import { useState } from 'react';
import { Rocket, CheckCircle, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';
import { supabase, WebsiteAnalysis } from '../lib/supabase';

interface ConsultationAdProps {
  analysis: WebsiteAnalysis;
}

export function ConsultationAd({ analysis }: ConsultationAdProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const criticalIssues = [
    analysis.structured_data_score < 50 ? 'Missing critical structured data' : null,
    analysis.accessibility_score < 50 ? 'Accessibility barriers blocking AI crawlers' : null,
    analysis.technical_seo_score < 50 ? 'Technical SEO gaps limiting discoverability' : null,
    analysis.content_quality_score < 50 ? 'Content structure needs optimization' : null,
  ].filter(Boolean);

  const hasSignificantIssues = analysis.overall_score < 70;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: leadData, error: insertError } = await supabase
        .from('consultation_leads')
        .insert({
          email: email.trim(),
          analysis_id: analysis.id,
          website_url: analysis.url,
          overall_score: analysis.overall_score,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      if (!leadData) {
        console.error('No lead data returned from insert');
        throw new Error('Failed to create lead record');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-consultation-email`;
      const emailResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: leadData.id,
          email: email.trim(),
          websiteUrl: analysis.url,
          overallScore: analysis.overall_score,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Email sending failed:', errorData);
        setError('Your request was saved, but we had trouble sending the confirmation email. We\'ll still contact you within 24 hours.');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-2">You're All Set!</h3>
          <p className="text-gray-600 mb-4">
            We'll reach out within 24 hours to schedule your free consultation.
          </p>
          <p className="text-sm text-gray-500">
            In the meantime, check your inbox for resources to get started on quick wins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Rocket className="w-7 h-7 text-black" />
          </div>
          <div className="flex-1">
            <div className="inline-block bg-white text-black text-xs font-medium px-3 py-1 rounded-full mb-2">
              LIMITED TIME OFFER
            </div>
            <h3 className="text-2xl font-medium text-white mb-2">
              {hasSignificantIssues
                ? "Don't Let AI Search Engines Pass You By"
                : "Take Your AI Readiness to the Next Level"}
            </h3>
            <p className="text-gray-300 text-lg">
              {hasSignificantIssues
                ? `Your site scored ${analysis.overall_score}/100. Every point you're missing means lost visibility in AI search results.`
                : `You're close to perfect AI readiness. Let us help you achieve that final 20% for maximum impact.`}
            </p>
          </div>
        </div>

        {hasSignificantIssues && criticalIssues.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
            <p className="text-white font-medium mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Critical Issues Detected:
            </p>
            <ul className="space-y-2">
              {criticalIssues.slice(0, 3).map((issue, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-white mt-0.5">⚠</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <Zap className="w-6 h-6 text-white mb-2" />
            <h4 className="text-white font-medium mb-1">Fast Results</h4>
            <p className="text-gray-300 text-sm">See improvements within 2-4 weeks</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <TrendingUp className="w-6 h-6 text-white mb-2" />
            <h4 className="text-white font-medium mb-1">Proven Track Record</h4>
            <p className="text-gray-300 text-sm">Average 45% score improvement</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <Shield className="w-6 h-6 text-white mb-2" />
            <h4 className="text-white font-medium mb-1">Future-Proof</h4>
            <p className="text-gray-300 text-sm">Stay ahead of AI search trends</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h4 className="text-xl font-medium text-gray-900 mb-2">
            Get Your Free AI Readiness Consultation
          </h4>
          <p className="text-gray-600 mb-4">
            Our experts at <span className="font-medium text-black">Round 1 Solutions</span> will create a custom roadmap to fix these issues and skyrocket your AI search visibility.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Your Free Consultation Includes:</p>
            <ul className="space-y-1.5">
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
                <span>30-minute strategy session with an AI SEO specialist</span>
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
                <span>Custom implementation roadmap prioritized by impact</span>
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
                <span>Competitive analysis vs. top-ranking sites in your niche</span>
              </li>
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
                <span>Quick-win recommendations you can implement today</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-medium py-4 px-6 rounded-lg hover:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Claim Your Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-3">
            No commitment required. We respect your privacy and won't spam you.
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Get ahead of your competition and improve your AI search rankings with Round 1 Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
