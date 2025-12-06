"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("price_cents", { ascending: true });

  if (error) {
    console.error("[PLANS_GET]", error);
    return NextResponse.json(
      { error: "Failed to load plans" },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}