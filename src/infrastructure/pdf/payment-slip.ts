import "server-only";

import PDFDocument from "pdfkit";
import type { LocatarPaymentSlip } from "@/application/use-cases/get-locatar-payment-slip";
import { formatCurrency } from "@/lib/format";
import { formatMonthLabel } from "@/lib/date";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  NEPLATIT: "Neplătit",
  PARTIAL: "Parțial plătit",
  PLATIT: "Plătit",
};

function line(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  options?: { bold?: boolean },
) {
  doc
    .font(options?.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(11)
    .text(label, { continued: true, width: 300 })
    .text(value, { align: "right" });
}

export function generatePaymentSlipPdf(slip: LocatarPaymentSlip): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(18).text("Listă de plată", { align: "center" });
    doc.moveDown(0.5);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(formatMonthLabel(slip.costs.month), { align: "center" });
    doc.moveDown(1.5);

    doc.font("Helvetica-Bold").fontSize(12).text("Date locatar");
    doc.moveDown(0.3);
    line(doc, "Nume", slip.residentName);
    line(doc, "Bloc", slip.apartment.blockName);
    line(doc, "Scară", slip.apartment.staircaseName);
    line(doc, "Apartament", slip.apartment.apartmentNumber);
    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(12).text("Defalcare costuri");
    doc.moveDown(0.3);
    line(doc, "Consum apă rece (m³)", String(slip.costs.coldWaterConsumption));
    line(doc, "Consum canalizare (m³)", String(slip.costs.sewageConsumption));
    line(
      doc,
      "Cost apă rece",
      formatCurrency(slip.costs.coldWaterConsumption * slip.costs.waterPrice),
    );
    line(
      doc,
      "Cost canalizare",
      formatCurrency(slip.costs.sewageConsumption * slip.costs.sewagePrice),
    );
    line(doc, "Electricitate părți comune", formatCurrency(slip.costs.electricityCost));
    line(doc, "Curățenie", formatCurrency(slip.costs.cleaningCost));
    line(doc, "Gunoi", formatCurrency(slip.costs.garbageCost));
    line(doc, "Reparații", formatCurrency(slip.costs.repairsCost));
    line(doc, "Fond rulment", formatCurrency(slip.costs.fundingFundCost));
    line(doc, "Alte cheltuieli", formatCurrency(slip.costs.otherCosts));
    line(doc, "Restanțe", formatCurrency(slip.costs.debt));
    line(doc, "Penalități", formatCurrency(slip.costs.penalties));
    doc.moveDown(0.5);
    doc.moveTo(doc.x, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    line(doc, "TOTAL DE PLATĂ", formatCurrency(slip.costs.totalAmount), { bold: true });
    doc.moveDown(0.3);
    line(doc, "Status plată", PAYMENT_STATUS_LABELS[slip.costs.paymentStatus]);

    doc.end();
  });
}
