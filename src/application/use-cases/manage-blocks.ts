import "server-only";

import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import {
  createBlock as createBlockRepo,
  listBlocksForAdmin,
} from "@/infrastructure/supabase/repositories/blocks.repository";
import {
  createStaircase as createStaircaseRepo,
  listStaircasesByBlock,
} from "@/infrastructure/supabase/repositories/staircases.repository";
import {
  createApartment as createApartmentRepo,
  listApartmentsByStaircase,
} from "@/infrastructure/supabase/repositories/apartments.repository";
import { assignResident as assignResidentRepo } from "@/infrastructure/supabase/repositories/residents.repository";
import { findActiveResidentByApartmentId } from "@/infrastructure/supabase/repositories/residents.repository";
import { findUserByEmailAsAdmin } from "@/infrastructure/supabase/repositories/users.repository";
import { recordAuditLog } from "@/infrastructure/supabase/repositories/audit-log.repository";

export interface BlockSummary {
  id: string;
  name: string;
  address: string;
  staircaseCount: number;
  apartmentCount: number;
}

export async function listAdminBlocks(): Promise<BlockSummary[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();
  const blocks = await listBlocksForAdmin(supabase);

  return Promise.all(
    blocks.map(async (block) => {
      const staircases = await listStaircasesByBlock(supabase, block.id);
      const apartmentCounts = await Promise.all(
        staircases.map((s) => listApartmentsByStaircase(supabase, s.id)),
      );
      return {
        id: block.id,
        name: block.name,
        address: block.address,
        staircaseCount: staircases.length,
        apartmentCount: apartmentCounts.reduce((sum, a) => sum + a.length, 0),
      };
    }),
  );
}

export interface ApartmentWithResident {
  id: string;
  number: string;
  floor: number | null;
  residentName: string | null;
}

export interface StaircaseWithApartments {
  id: string;
  name: string;
  apartments: ApartmentWithResident[];
}

export interface BlockDetail {
  id: string;
  name: string;
  address: string;
  staircases: StaircaseWithApartments[];
}

export async function getBlockDetail(blockId: string): Promise<BlockDetail | null> {
  if (process.env.DISABLE_AUTH === "true") return null;

  const supabase = await createSupabaseServerClient();

  const { data: block } = await supabase
    .from("blocks")
    .select("id, name, address")
    .eq("id", blockId)
    .maybeSingle();

  if (!block) return null;

  const staircases = await listStaircasesByBlock(supabase, blockId);

  const staircasesWithApartments = await Promise.all(
    staircases.map(async (staircase) => {
      const apartments = await listApartmentsByStaircase(supabase, staircase.id);
      const apartmentsWithResident = await Promise.all(
        apartments.map(async (apartment) => {
          const resident = await findActiveResidentByApartmentId(supabase, apartment.id);
          let residentName: string | null = null;
          if (resident) {
            const { data: profile } = await supabase
              .from("users")
              .select("name")
              .eq("id", resident.user_id)
              .maybeSingle();
            residentName = profile?.name ?? null;
          }
          return {
            id: apartment.id,
            number: apartment.number,
            floor: apartment.floor,
            residentName,
          };
        }),
      );
      return { id: staircase.id, name: staircase.name, apartments: apartmentsWithResident };
    }),
  );

  return { id: block.id, name: block.name, address: block.address, staircases: staircasesWithApartments };
}

export async function createBlock(input: {
  name: string;
  address: string;
  adminId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const block = await createBlockRepo(supabase, {
    name: input.name,
    address: input.address,
    createdBy: input.adminId,
  });
  await recordAuditLog({
    actorId: input.adminId,
    action: "CREATE_BLOCK",
    entity: "blocks",
    entityId: block.id,
    diff: { name: input.name, address: input.address },
  });
  return block;
}

export async function createStaircase(input: {
  blockId: string;
  name: string;
  adminId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const staircase = await createStaircaseRepo(supabase, {
    blockId: input.blockId,
    name: input.name,
  });
  await recordAuditLog({
    actorId: input.adminId,
    action: "CREATE_STAIRCASE",
    entity: "staircases",
    entityId: staircase.id,
    diff: { name: input.name, blockId: input.blockId },
  });
  return staircase;
}

export async function createApartment(input: {
  staircaseId: string;
  number: string;
  floor: number | null;
  adminId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const apartment = await createApartmentRepo(supabase, {
    staircaseId: input.staircaseId,
    number: input.number,
    floor: input.floor,
  });
  await recordAuditLog({
    actorId: input.adminId,
    action: "CREATE_APARTMENT",
    entity: "apartments",
    entityId: apartment.id,
    diff: { number: input.number, staircaseId: input.staircaseId },
  });
  return apartment;
}

export interface ApartmentOption {
  id: string;
  label: string;
}

/** Listă plată de apartamente ("Bloc / Scară / Apt X"), pentru select-uri. */
export async function listApartmentOptionsForAdmin(): Promise<ApartmentOption[]> {
  if (process.env.DISABLE_AUTH === "true") return [];

  const supabase = await createSupabaseServerClient();
  const blocks = await listBlocksForAdmin(supabase);

  const options: ApartmentOption[] = [];
  for (const block of blocks) {
    const staircases = await listStaircasesByBlock(supabase, block.id);
    for (const staircase of staircases) {
      const apartments = await listApartmentsByStaircase(supabase, staircase.id);
      for (const apartment of apartments) {
        options.push({
          id: apartment.id,
          label: `${block.name} / ${staircase.name} / Ap. ${apartment.number}`,
        });
      }
    }
  }
  return options;
}

export type AssignResidentResult =
  | { ok: true }
  | { ok: false; error: "USER_NOT_FOUND" | "USER_NOT_LOCATAR" };

export async function assignResidentByEmail(input: {
  apartmentId: string;
  email: string;
  adminId: string;
}): Promise<AssignResidentResult> {
  const targetUser = await findUserByEmailAsAdmin(input.email);
  if (!targetUser) return { ok: false, error: "USER_NOT_FOUND" };
  if (targetUser.role !== "LOCATAR") return { ok: false, error: "USER_NOT_LOCATAR" };

  const supabase = await createSupabaseServerClient();
  await assignResidentRepo(supabase, {
    apartmentId: input.apartmentId,
    userId: targetUser.id,
  });

  await recordAuditLog({
    actorId: input.adminId,
    action: "ASSIGN_RESIDENT",
    entity: "residents",
    entityId: input.apartmentId,
    diff: { apartmentId: input.apartmentId, userEmail: input.email },
  });

  return { ok: true };
}
