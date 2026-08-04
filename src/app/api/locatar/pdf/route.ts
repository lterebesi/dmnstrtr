import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLocatarPaymentSlip } from "@/application/use-cases/get-locatar-payment-slip";
import { generatePaymentSlipPdf } from "@/infrastructure/pdf/payment-slip";
import { currentMonthDateString } from "@/lib/date";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (user.role !== "LOCATAR") {
    return NextResponse.json({ error: "Doar locatarii pot descărca lista de plată." }, { status: 403 });
  }

  const monthParam = request.nextUrl.searchParams.get("month");
  const month = monthParam
    ? `${monthParam.slice(0, 7)}-01`
    : currentMonthDateString();

  const slip = await getLocatarPaymentSlip(user.id, user.name, month);
  if (!slip) {
    return NextResponse.json(
      { error: "Nu există listă de plată generată pentru această lună." },
      { status: 404 },
    );
  }

  const pdfBuffer = await generatePaymentSlipPdf(slip);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="lista-plata-${month}.pdf"`,
    },
  });
}
