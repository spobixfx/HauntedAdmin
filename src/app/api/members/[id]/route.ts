"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing member id" }, { status: 400 });
    }

    if (body?.restore === true) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("members")
        .update({
          deleted_at: null,
          deleted_reason: null,
          deleted_by: null,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error || !data) {
        const raw =
          (error as any)?.message ||
          (error as any)?.details ||
          "Failed to restore member";
        return NextResponse.json({ error: raw }, { status: 500 });
      }

      return NextResponse.json({ member: data }, { status: 200 });
    }

    const extendDaysRaw = body?.extendDays;
    const setEndDateRaw = body?.setEndDate;

    const extendDays =
      typeof extendDaysRaw === "number"
        ? extendDaysRaw
        : typeof extendDaysRaw === "string"
          ? Number(extendDaysRaw)
          : null;

    const setEndDate =
      typeof setEndDateRaw === "string" && setEndDateRaw.trim().length > 0
        ? setEndDateRaw.trim()
        : null;

    if (!extendDays && !setEndDate) {
      return NextResponse.json(
        { error: "Either extendDays or setEndDate is required" },
        { status: 400 }
      );
    }

    if (extendDays !== null && (Number.isNaN(extendDays) || extendDays <= 0)) {
      return NextResponse.json(
        { error: "extendDays must be a positive number" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const currentEnd =
      existing.end_date && typeof existing.end_date === "string"
        ? new Date(existing.end_date)
        : null;

    const startDate =
      existing.start_date && typeof existing.start_date === "string"
        ? new Date(existing.start_date)
        : null;

    const isLifetime = !existing.end_date;

    let newEnd: Date | null = null;

    if (setEndDate) {
      const parsed = new Date(setEndDate);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid setEndDate" },
          { status: 400 }
        );
      }
      if (startDate && parsed.getTime() < startDate.getTime()) {
        return NextResponse.json(
          { error: "End date cannot be before start date" },
          { status: 400 }
        );
      }
      newEnd = parsed;
    } else if (extendDays) {
      const base =
        currentEnd && currentEnd.getTime() > today.getTime() ? currentEnd : today;
      const next = new Date(base);
      next.setUTCDate(next.getUTCDate() + extendDays);
      newEnd = next;
    }

    if (!newEnd) {
      return NextResponse.json(
        { error: "Unable to determine new end date" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("members")
      .update({ end_date: newEnd.toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      const raw =
        (updateError as any)?.message ||
        (updateError as any)?.details ||
        "Failed to extend membership";
      return NextResponse.json({ error: raw }, { status: 500 });
    }

    return NextResponse.json({ member: updated }, { status: 200 });
  } catch (err: any) {
    const message =
      err?.message ||
      (err as any)?.error ||
      "Failed to process membership extension";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");
    const force = searchParams.get("force") === "true";
    const { id: idFromParams } = await context.params;
    const id = idFromQuery ?? idFromParams;

    if (!id) {
      return NextResponse.json(
        { error: "Missing member id" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    if (force) {
      const { error, count } = await supabase
        .from("members")
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
    }

    const { data, error } = await supabase
      .from("members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to soft delete member", error);

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

    if (!data) {
      return NextResponse.json(
        { error: "Member not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member: data });
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