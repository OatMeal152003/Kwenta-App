import Link from "next/link";
import DebtManager from "@/components/debts/DebtManager";
import { Icon } from "@/components/icons";

export default function DebtsPage() {
  return (
    <main className="page-enter mx-auto max-w-md p-4 pb-28">
      <div className="flex items-center gap-1">
        <Link href="/me" aria-label="Back to Me" className="rounded-full p-2 text-ink">
          <Icon name="chev-left" size={26} strokeWidth={2.5} />
        </Link>
        <h1 className="font-heading text-3xl font-extrabold text-ink">Utang</h1>
      </div>
      <DebtManager />
    </main>
  );
}
