"use client";

import { Award, Download, GraduationCap } from "lucide-react";
import type { Certificate } from "@/lib/types";
import { useI18n, useT } from "@/lib/i18n";
import { Button, Dialog } from "./ui";
import { formatDate } from "@/lib/utils";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";

export function CertificateModal({
  cert,
  open,
  onClose,
}: {
  cert: Certificate | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const { lang } = useI18n();
  if (!cert) return null;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl">
      <div className="rounded-[var(--radius-lg)] border-2 border-primary/40 bg-gradient-to-br from-secondary/40 to-card p-8 text-center">
        <Award className="mx-auto h-14 w-14 text-primary" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Certificate of Completion
        </p>
        <p className="mt-4 text-sm text-muted-foreground">This certifies that</p>
        <p className="mt-1 text-2xl font-bold">{cert.userName}</p>
        <p className="mt-3 text-sm text-muted-foreground">has successfully completed</p>
        <p className="mt-1 text-lg font-semibold gradient-text">{cert.courseTitle}</p>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <GraduationCap className="h-4 w-4" /> Mentoria Hub
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>Code: {cert.code}</span>
          <span>{formatDate(cert.issuedAt, lang)}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" onClick={() => downloadCertificatePdf(cert, lang)}>
          <Download className="h-4 w-4" /> {t("cert.downloadPdf")}
        </Button>
        <Button className="flex-1" variant="outline" onClick={onClose}>
          {t("common.close")}
        </Button>
      </div>
    </Dialog>
  );
}
