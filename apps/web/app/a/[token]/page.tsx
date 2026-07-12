import Link from "next/link";
import { AgreementGuestView } from "@/components/agreement-guest";
import { DNLogoMark } from "@/components/ui/logo";

export default async function AgreementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" aria-label="DebtNote home">
          <DNLogoMark compact />
        </Link>
      </header>
      <div className="px-6 py-12">
        <AgreementGuestView token={token} />
      </div>
    </div>
  );
}
