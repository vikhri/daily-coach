import { NextResponse } from "next/server";
import { analyzeReport } from "@/lib/ai/analyze";
import { reportFormSchema } from "@/lib/schemas";
import { getAuthenticatedProfile } from "@/lib/server-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    const payload = reportFormSchema.parse(await request.json());
    const supabase = createServiceSupabaseClient();

    const { data: latestWeight } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("profile_id", profile.id)
      .lte("log_date", payload.report_date)
      .order("log_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: report, error: reportError } = await supabase
      .from("daily_reports")
      .upsert(
        {
          ...payload,
          profile_id: profile.id,
          weight_snapshot: latestWeight?.weight_kg ?? null
        },
        { onConflict: "profile_id,report_date" }
      )
      .select("*")
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: reportError?.message ?? "Save report failed" }, { status: 500 });
    }

    const { data: recentReports } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("profile_id", profile.id)
      .lt("report_date", payload.report_date)
      .order("report_date", { ascending: false })
      .limit(3);

    const analysis = await analyzeReport({
      profile,
      currentReport: report,
      latestWeight: latestWeight ?? null,
      recentReports: recentReports ?? []
    });

    const { data: feedback, error: feedbackError } = await supabase
      .from("ai_feedback")
      .upsert(
        {
          report_id: report.id,
          profile_id: profile.id,
          model: process.env.OPENAI_API_KEY ? "gpt-4.1-mini" : "mock-fallback",
          ...analysis,
          raw_response: analysis
        },
        { onConflict: "report_id" }
      )
      .select("*")
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        { error: feedbackError?.message ?? "Save feedback failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reportId: report.id,
      analysis: feedback,
      latestWeight: latestWeight ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analyze report failed" },
      { status: 400 }
    );
  }
}
