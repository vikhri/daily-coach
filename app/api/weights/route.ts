import { NextRequest, NextResponse } from "next/server";
import { weightLogSchema } from "@/lib/schemas";
import { getAuthenticatedProfile } from "@/lib/server-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile();
    const supabase = createServiceSupabaseClient();
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");

    const { data, error } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("profile_id", profile.id)
      .order("log_date", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      latestWeight: data[0] ?? null,
      weights: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load weights" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    const body = weightLogSchema.parse(await request.json());
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("weight_logs")
      .upsert(
        {
          ...body,
          profile_id: profile.id
        },
        { onConflict: "profile_id,log_date" }
      )
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Unable to save weight" }, { status: 500 });
    }

    return NextResponse.json({ weight: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save weight" },
      { status: 400 }
    );
  }
}
