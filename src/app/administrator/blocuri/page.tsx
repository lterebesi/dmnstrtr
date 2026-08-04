import type { Metadata } from "next";
import Link from "next/link";
import { listAdminBlocks } from "@/application/use-cases/manage-blocks";
import { Card } from "@/components/ui/Card";
import { CreateBlockForm } from "@/components/admin/CreateBlockForm";

export const metadata: Metadata = { title: "Blocuri · Administrator" };

export default async function BlocuriPage() {
  const blocks = await listAdminBlocks();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Creează bloc</h2>
        <div className="mt-3">
          <CreateBlockForm />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Blocurile tale</h2>
        {blocks.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            Nu ai niciun bloc încă — creează unul mai sus.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {blocks.map((block) => (
              <li key={block.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/administrator/blocuri/${block.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {block.name}
                  </Link>
                  <p className="text-sm text-gray-500">{block.address}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {block.staircaseCount} scări · {block.apartmentCount} apartamente
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
