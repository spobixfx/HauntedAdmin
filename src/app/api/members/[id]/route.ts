"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  return NextResponse.json({ id, ...body }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");
    const { id: idFromParams } = await context.params;
    const id = idFromQuery ?? idFromParams;

    if (!id) {
      return NextResponse.json(
        { error: "Missing member id" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error, count } = await supabase
      .from("haunted_members")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      console.error("Failed to delete member", error);

      const rawMessage =
        (error as any)?.message ||
        (error as any)?.details ||
        (error as any)?.hint ||
        JSON.stringify(error);

      const message =
        typeof rawMessage === "string" && rawMessage.length > 0
          ? rawMessage
          : "Failed to delete member";

      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!count || count === 0) {
      console.warn("Delete member: no rows deleted for id", id);
      return NextResponse.json(
        { error: "Member not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in delete member", err);
    const raw =
      err?.message || (err as any)?.error || JSON.stringify(err);
    const message =
      typeof raw === "string" && raw.length > 0
        ? raw
        : "Failed to delete member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}