import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  leadId: string;
  email: string;
  websiteUrl: string;
  overallScore: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { leadId, email, websiteUrl, overallScore }: EmailRequest = await req.json();

    if (!leadId || !email || !websiteUrl || overallScore === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "horrorfarm@gmail.com";

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "Your Free AI Readiness Consultation - Next Steps",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your AI Readiness Consultation</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); padding: 40px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Interest!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">We're excited to help optimize your website for AI search</p>
              </div>

              <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Your Analysis Summary</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                  <p style="margin: 0 0 10px 0;"><strong>Website:</strong> ${websiteUrl}</p>
                  <p style="margin: 0;"><strong>Overall AI Readiness Score:</strong> <span style="font-size: 24px; color: ${overallScore >= 70 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${overallScore}/100</span></p>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="color: #1e293b; font-size: 22px;">What Happens Next?</h2>
                <ol style="padding-left: 20px;">
                  <li style="margin-bottom: 15px;">
                    <strong>Within 24 Hours:</strong> Our AI SEO specialist will reach out to schedule your free 30-minute consultation at a time that works for you.
                  </li>
                  <li style="margin-bottom: 15px;">
                    <strong>During Your Consultation:</strong> We'll review your analysis in detail, discuss your specific goals, and create a custom roadmap to improve your AI search visibility.
                  </li>
                  <li style="margin-bottom: 15px;">
                    <strong>After the Call:</strong> You'll receive a prioritized implementation plan with quick wins you can start implementing immediately.
                  </li>
                </ol>
              </div>

              <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">💡 Quick Win: Start Today</h3>
                <p style="margin: 0; color: #064e3b;">While you wait for your consultation, ensure your website has a clear, descriptive meta description and that all images have alt text. These simple changes can start improving your AI search visibility immediately!</p>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <p style="font-size: 18px; color: #1e293b; margin-bottom: 15px;"><strong>Questions before we connect?</strong></p>
                <p style="margin: 0; color: #64748b;">Reply to this email and we'll get back to you right away.</p>
              </div>

              <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  <strong>Round 1 Solutions</strong><br>
                  Helping businesses thrive in the age of AI search
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">
                  You're receiving this email because you requested a consultation through Apex Analyst.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.json();
      throw new Error(`Failed to send user email: ${JSON.stringify(errorData)}`);
    }

    // Send notification email to admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `New Consultation Lead: ${websiteUrl} (Score: ${overallScore})`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>New Consultation Lead</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">New Consultation Request</h1>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #1e293b;">Lead Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Website:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${websiteUrl}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Overall Score:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="font-size: 20px; font-weight: bold; color: ${overallScore >= 70 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444'};">${overallScore}/100</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Lead ID:</strong></td>
                    <td style="padding: 10px 0; font-family: monospace; font-size: 12px;">${leadId}</td>
                  </tr>
                </table>
              </div>

              <div style="background: ${overallScore < 70 ? '#fef3c7' : '#d1fae5'}; border-left: 4px solid ${overallScore < 70 ? '#f59e0b' : '#10b981'}; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-weight: 600;">
                  ${overallScore < 70
                    ? '⚠️ This lead has significant optimization opportunities - high conversion potential!'
                    : '✅ This lead is close to AI-ready but wants to maximize their results.'}
                </p>
              </div>

              <div style="margin: 30px 0;">
                <p style="font-weight: 600; margin-bottom: 10px;">Next Steps:</p>
                <ol style="padding-left: 20px;">
                  <li>Reach out within 24 hours to schedule consultation</li>
                  <li>Review their full analysis in the dashboard</li>
                  <li>Prepare custom recommendations based on their score</li>
                </ol>
              </div>

              <div style="border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">
                  This notification was sent from Apex Analyst.<br>
                  Timestamp: ${new Date().toLocaleString()}
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    // Update the consultation_leads record
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabase
      .from("consultation_leads")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    if (updateError) {
      console.error("Failed to update lead record:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error sending emails:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send emails"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
