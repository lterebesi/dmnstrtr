import { Card } from "@/components/ui/Card";

interface ComingSoonProps {
  title: string;
  stage: string;
}

export function ComingSoon({ title, stage }: ComingSoonProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">
        Disponibil din {stage}. Vezi{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
          docs/PLAN.md
        </code>{" "}
        pentru planul complet pe etape.
      </p>
    </Card>
  );
}
