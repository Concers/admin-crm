import { Topbar } from "@/components/layout/topbar";

export function PageShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <>
      <Topbar title={title} />
      <main className="flex-1 space-y-6 p-6">
        {actions && <div className="flex justify-end">{actions}</div>}
        {children}
      </main>
    </>
  );
}
