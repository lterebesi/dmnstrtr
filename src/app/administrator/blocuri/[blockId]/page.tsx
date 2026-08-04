import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlockDetail } from "@/application/use-cases/manage-blocks";
import { Card } from "@/components/ui/Card";
import {
  StaircaseForm,
  ApartmentForm,
  AssignResidentForm,
} from "@/components/admin/BlockDetailForms";

export const metadata: Metadata = { title: "Detaliu bloc · Administrator" };

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const { blockId } = await params;
  const block = await getBlockDetail(blockId);

  if (!block) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">{block.name}</h2>
        <p className="text-sm text-gray-500">{block.address}</p>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-gray-900">Adaugă scară</h3>
        <div className="mt-3">
          <StaircaseForm blockId={block.id} />
        </div>
      </Card>

      {block.staircases.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">
            Nicio scară adăugată încă — adaugă una mai sus.
          </p>
        </Card>
      ) : (
        block.staircases.map((staircase) => (
          <Card key={staircase.id}>
            <h3 className="text-base font-semibold text-gray-900">
              Scara {staircase.name}
            </h3>

            <div className="mt-3">
              <ApartmentForm blockId={block.id} staircaseId={staircase.id} />
            </div>

            {staircase.apartments.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Niciun apartament încă.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {staircase.apartments.map((apartment) => (
                  <li key={apartment.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-gray-900">
                        Ap. {apartment.number}
                        {apartment.floor !== null ? ` · etaj ${apartment.floor}` : ""}
                      </span>
                      {apartment.residentName ? (
                        <span className="text-sm text-gray-600">
                          Locatar: {apartment.residentName}
                        </span>
                      ) : (
                        <span className="text-sm text-amber-600">Fără locatar</span>
                      )}
                    </div>
                    {!apartment.residentName && (
                      <div className="mt-2">
                        <AssignResidentForm blockId={block.id} apartmentId={apartment.id} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
