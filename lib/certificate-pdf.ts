import { jsPDF } from "jspdf";
import type { Certificate } from "./types";
import { formatDate } from "./utils";

/**
 * Builds a printable A4 landscape certificate and triggers a download.
 * Pure client-side — no server round-trip.
 */
export function downloadCertificatePdf(cert: Certificate, locale = "en") {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, W, H, "F");

  // Outer + inner decorative borders
  doc.setDrawColor(99, 102, 241); // indigo
  doc.setLineWidth(2);
  doc.rect(10, 10, W - 20, H - 20);
  doc.setDrawColor(167, 139, 250); // violet
  doc.setLineWidth(0.5);
  doc.rect(15, 15, W - 30, H - 30);

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(16);
  doc.text("MENTORIA HUB", W / 2, 32, { align: "center" });

  // Title
  doc.setTextColor(30, 30, 40);
  doc.setFontSize(34);
  doc.text("Certificate of Completion", W / 2, 58, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 100);
  doc.text("This certifies that", W / 2, 78, { align: "center" });

  // Recipient name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(20, 20, 30);
  doc.text(cert.userName, W / 2, 96, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 100);
  doc.text("has successfully completed the course", W / 2, 112, { align: "center" });

  // Course title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text(cert.courseTitle, W / 2, 128, { align: "center", maxWidth: W - 60 });

  // Footer: code + date with a divider line
  const fy = H - 38;
  doc.setDrawColor(210, 210, 220);
  doc.setLineWidth(0.4);
  doc.line(40, fy, W - 40, fy);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 120);
  doc.text(`Certificate code: ${cert.code}`, 40, fy + 8);
  doc.text(`Issued: ${formatDate(cert.issuedAt, locale)}`, W - 40, fy + 8, { align: "right" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 160);
  doc.text("Mentoria Hub — Opportunities & Async Learning", W / 2, H - 20, { align: "center" });

  const safeName = cert.courseTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`mentoria-certificate-${safeName}.pdf`);
}
