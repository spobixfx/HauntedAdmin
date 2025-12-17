"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trashed = searchParams.get("trashed") === "true";

  const supabase = createClient();
  const query = supabase
    .from("members")
    .select("*")
    .order("start_date", { ascending: false });

  if (trashed) {
    query.not("deleted_at", "is", null);
  } else {
    query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [], { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      discordUsername,
      discordId,
      plan,
      planName,
      price,
      priceUsd,
      startDate,
      endDate,
      discountPercent,
    } = body || {};

    const supabase = createClient();

    const priceCents =
      typeof priceUsd === "number"
        ? Math.round(priceUsd * 100)
        : typeof price === "number"
          ? Math.round(price * 100)
          : null;

    const startDateIso =
      typeof startDate === "string" && startDate.length > 0
        ? new Date(`${startDate}T00:00:00.000Z`).toISOString()
        : null;

    const endDateIso =
      typeof endDate === "string" && endDate.length > 0
        ? endDate === "lifetime"
          ? null
          : new Date(`${endDate}T00:00:00.000Z`).toISOString()
        : null;

    const parsedDiscount =
      typeof discountPercent === "number"
        ? discountPercent
        : typeof discountPercent === "string"
          ? Number(discountPercent)
          : 0;

    if (
      parsedDiscount !== null &&
      parsedDiscount !== undefined &&
      !Number.isFinite(parsedDiscount)
    ) {
      return NextResponse.json(
        { error: "discountPercent must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    if (parsedDiscount < 0 || parsedDiscount > 100) {
      return NextResponse.json(
        { error: "discountPercent must be between 0 and 100" },
        { status: 400 }
      );
    }

    const normalizedDiscount =
      parsedDiscount > 0
        ? Math.min(100, Math.max(0, Math.round(parsedDiscount * 100) / 100))
        : 0;

    const insertPayload = {
      discord_username: discordUsername || null,
      discord_id: discordId || null,
      plan: planName || plan || null,
      price_cents: priceCents,
      start_date: startDateIso,
      end_date: endDateIso,
      discount_percent: normalizedDiscount,
    };

    const { data, error } = await supabase
      .from("members")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("[MEMBERS_POST_INSERT]", error);

      const rawMessage =
        (error as any)?.message ||
        (error as any)?.details ||
        (error as any)?.hint ||
        JSON.stringify(error);

      const message =
        typeof rawMessage === "string" && rawMessage.length > 0
          ? rawMessage
          : "Failed to create member";

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("[MEMBERS_POST]", err);

    const message =
      err?.message && typeof err.message === "string"
        ? err.message
        : "Failed to create member";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!memberId) {
      return NextResponse.json(
        { error: "Missing member id" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    if (force) {
      const { error } = await supabase.from("members").delete().eq("id", memberId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from("members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", memberId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message =
      err?.message || (err as any)?.error || "Failed to delete member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      discordUsername,
      discordId,
      planName,
      priceUsd,
      startDate,
      endDate,
      discountPercent,
    } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const price_cents =
      typeof priceUsd === "number" ? Math.round(priceUsd * 100) : null;

    const start_date =
      startDate && typeof startDate === "string"
        ? new Date(`${startDate}T00:00:00Z`).toISOString()
        : null;

    const end_date =
      endDate && typeof endDate === "string"
        ? new Date(`${endDate}T00:00:00Z`).toISOString()
        : null;

    let normalizedDiscount: number | undefined = undefined;
    const hasDiscountField =
      discountPercent !== undefined &&
      discountPercent !== null &&
      discountPercent !== '';

    if (hasDiscountField) {
      const parsed =
        typeof discountPercent === "number"
          ? discountPercent
          : typeof discountPercent === "string"
            ? Number(discountPercent)
            : null;

      if (parsed === null || !Number.isFinite(parsed)) {
        return NextResponse.json(
          { error: "discountPercent must be a number between 0 and 100" },
          { status: 400 }
        );
      }

      if (parsed < 0 || parsed > 100) {
        return NextResponse.json(
          { error: "discountPercent must be between 0 and 100" },
          { status: 400 }
        );
      }

      normalizedDiscount =
        parsed > 0
          ? Math.min(100, Math.max(0, Math.round(parsed * 100) / 100))
          : 0;
    }

    const payload: Record<string, any> = {
      discord_username: discordUsername ?? null,
      discord_id: discordId ?? null,
      plan: planName ?? null,
      price_cents,
      start_date,
      end_date,
    };

    if (hasDiscountField) {
      payload.discount_percent = normalizedDiscount;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("members")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("PATCH /members update error", error);

      const raw =
        (error as any)?.message ||
        (error as any)?.details ||
        (error as any)?.hint ||
        JSON.stringify(error);

      return NextResponse.json({ error: raw }, { status: 500 });
    }

    return NextResponse.json({ member: data }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /members fatal", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
