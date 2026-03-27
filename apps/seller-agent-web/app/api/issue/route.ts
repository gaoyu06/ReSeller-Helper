import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { issueCode } from "@/lib/issue-code";

const requestSchema = z.object({
  codeTypeId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "AGENT") {
      return NextResponse.json(
        {
          ok: false,
          error: "未登录或无权访问。",
        },
        { status: 401 },
      );
    }

    const payload = requestSchema.parse(await request.json());
    const result = await issueCode({
      agentId: session.user.id,
      codeTypeId: payload.codeTypeId,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "发码失败。";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 },
    );
  }
}
