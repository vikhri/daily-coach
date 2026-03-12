import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/server-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile();
    const supabase = createServiceSupabaseClient();
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");

    const [{ data: reports, error: reportsError }, { data: latestWeight, error: weightError }] =
      await Promise.all([
        supabase
          .from("daily_reports")
          .select("*, ai_feedback(*)")
          .eq("profile_id", profile.id)
          .order("report_date", { ascending: false })
          .limit(limit),
        supabase
          .from("weight_logs")
          .select("*")
          .eq("profile_id", profile.id)
          .order("log_date", { ascending: false })
          .limit(1)
      ]);

    if (reportsError || weightError) {
      return NextResponse.json(
        { error: reportsError?.message ?? weightError?.message ?? "Load error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reports: reports ?? [],
      latestWeight: latestWeight?.[0] ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load reports" },
      { status: 400 }
    );
  }
}
