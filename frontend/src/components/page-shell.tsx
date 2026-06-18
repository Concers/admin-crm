import { Topbar } from "@/components/layout/topbar";

export function PageShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <>
      <Topbar title={title} description={description} />
      <main className="flex-1">
        <div className="space-y-6 p-4 sm:p-6">
          {actions && (
            <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
          )}
          {children}
        </div>
      </main>
    </>
  );
}
