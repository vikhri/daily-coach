import { NextResponse } from "next/server";
import { profileSettingsSchema } from "@/lib/schemas";
import { getAuthenticatedProfile } from "@/lib/server-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    const payload = profileSettingsSchema.parse(await request.json());
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", profile.id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Profile update failed" }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profile update failed" },
      { status: 400 }
    );
  }
}
