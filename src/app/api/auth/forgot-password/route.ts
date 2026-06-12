import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: true });

    const { email } = result.data;
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    // Only send if the account uses password auth; always return 200 to prevent enumeration
    if (user?.password) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.verificationToken.deleteMany({
        where: { identifier: `reset:${email}` },
      });
      await db.verificationToken.create({
        data: { identifier: `reset:${email}`, token, expires },
      });

      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      emailService
        .send({
          to: email,
          subject: "Reset your Formly password",
          body: buildResetEmail(resetUrl),
        })
        .catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}

function buildResetEmail(resetUrl: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
  <h1 style="font-size:20px;font-weight:700;color:#0F4C8F;margin:0 0 8px;">Reset your password</h1>
  <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
    Someone requested a password reset for your Formly account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
  </p>
  <a href="${resetUrl}" style="display:inline-block;background:#0F4C8F;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
    Reset password
  </a>
  <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;">
    If you didn't request this, you can safely ignore this email. Your password won't change.
  </p>
</div>`;
}
