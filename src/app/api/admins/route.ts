import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("haunted_admins")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ admins: data }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    let service;
    try {
      service = createServiceClient();
    } catch (err: any) {
      console.error("Failed to create service client", err);
      const rawMessage =
        err?.message || (err as any)?.error || JSON.stringify(err);
      const message =
        typeof rawMessage === "string" && rawMessage.length > 0
          ? rawMessage
          : "Failed to create service client";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const roleValue =
      typeof role === "string" && role.trim().length > 0 ? role.trim() : "Admin";
    const { data: invite, error: inviteError } =
      await service.auth.admin.inviteUserByEmail(email, {
        data: { role: roleValue, needs_password: true },
      });

    if (inviteError) {
      console.error("Failed to send admin invite", inviteError);

      const rawMessage =
        (inviteError as any)?.message ||
        (inviteError as any)?.error_description ||
        (inviteError as any)?.error ||
        JSON.stringify(inviteError);

      const message =
        typeof rawMessage === "string" && rawMessage.length > 0
          ? rawMessage
          : "Failed to send invite";

      const isAlreadyRegistered =
        typeof message === "string" &&
        (message.toLowerCase().includes("already registered") ||
          message.toLowerCase().includes("already exists"));

      if (!isAlreadyRegistered) {
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in admin invite", err);
    const raw =
      err?.message || (err as any)?.error || JSON.stringify(err);
    const message =
      typeof raw === "string" && raw.length > 0 ? raw : "Failed to invite admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing admin id" },
      { status: 400 }
    );
  }

  const db = createClient();

  const { data: adminRow, error: fetchError } = await db
    .from("haunted_admins")
    .select("id, auth_user_id")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json(
      { error: "Admin not found" },
      { status: 404 }
    );
  }

  if (adminRow?.auth_user_id) {
    try {
      const service = createServiceClient();
      const { error: deleteAuthError } = await service.auth.admin.deleteUser(
        adminRow.auth_user_id
      );
      if (deleteAuthError) {
        console.error("Failed to delete Auth user for admin", deleteAuthError);
      }
    } catch (err) {
      console.error("Failed to create service client for Auth delete", err);
    }
  }

  const { error: deleteDbError } = await db
    .from("haunted_admins")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    console.error("Failed to delete admin row", deleteDbError);
    return NextResponse.json(
      { error: "Failed to remove admin" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const { id, email, role, status, action } = body || {};

  if (!id) {
    return NextResponse.json(
      { error: "Missing admin id" },
      { status: 400 }
    );
  }

  const hasUpdateFields =
    typeof email === "string" ||
    typeof role === "string" ||
    typeof status === "string";

  // Resend invite (existing behavior)
  if (!hasUpdateFields && (!action || action === "resend")) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("haunted_admins")
      .update({
        status: "invited",
        created_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ admin: data }, { status: 200 });
  }

  // Update fields
  if (hasUpdateFields) {
    const updates: Record<string, any> = {};
    if (typeof email === "string") updates.email = email;
    if (typeof role === "string") updates.role = role;
    if (typeof status === "string") updates.status = status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No update fields provided" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("haunted_admins")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update admin", error);
      return NextResponse.json(
        { error: "Failed to update admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({ admin: data }, { status: 200 });
  }

  return NextResponse.json(
    { error: "No update fields provided" },
    { status: 400 }
  );
}

