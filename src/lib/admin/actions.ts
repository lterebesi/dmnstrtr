"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createBlock,
  createStaircase,
  createApartment,
  assignResidentByEmail,
} from "@/application/use-cases/manage-blocks";
import { generateMonthlyCosts } from "@/application/use-cases/generate-monthly-costs";
import { markPayment } from "@/application/use-cases/manage-payments";
import {
  createBlockSchema,
  createStaircaseSchema,
  createApartmentSchema,
  assignResidentSchema,
  monthlyCostsSchema,
  markPaymentSchema,
} from "@/lib/validation/admin";

export interface ActionState {
  error: string | null;
}

const INITIAL_STATE: ActionState = { error: null };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "ADMINISTRATOR") {
    return null;
  }
  return user;
}

export async function createBlockAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Doar administratorii pot crea blocuri." };

  const parsed = createBlockSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  await createBlock({ ...parsed.data, adminId: admin.id });
  revalidatePath("/administrator/blocuri");
  return INITIAL_STATE;
}

export async function createStaircaseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Doar administratorii pot adăuga scări." };

  const parsed = createStaircaseSchema.safeParse({
    blockId: formData.get("blockId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  await createStaircase({ ...parsed.data, adminId: admin.id });
  revalidatePath(`/administrator/blocuri/${parsed.data.blockId}`);
  return INITIAL_STATE;
}

export async function createApartmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Doar administratorii pot adăuga apartamente." };

  const parsed = createApartmentSchema.safeParse({
    staircaseId: formData.get("staircaseId"),
    number: formData.get("number"),
    floor: formData.get("floor") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  const blockId = formData.get("blockId");
  await createApartment({
    staircaseId: parsed.data.staircaseId,
    number: parsed.data.number,
    floor: parsed.data.floor ?? null,
    adminId: admin.id,
  });
  if (typeof blockId === "string") {
    revalidatePath(`/administrator/blocuri/${blockId}`);
  }
  return INITIAL_STATE;
}

export async function assignResidentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Doar administratorii pot asocia locatari." };

  const parsed = assignResidentSchema.safeParse({
    apartmentId: formData.get("apartmentId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  const result = await assignResidentByEmail({ ...parsed.data, adminId: admin.id });
  if (!result.ok) {
    return {
      error:
        result.error === "USER_NOT_FOUND"
          ? "Nu există niciun cont înregistrat cu acest email."
          : "Contul găsit nu are rolul Locatar.",
    };
  }

  const blockId = formData.get("blockId");
  if (typeof blockId === "string") {
    revalidatePath(`/administrator/blocuri/${blockId}`);
  }
  return INITIAL_STATE;
}

export async function generateMonthlyCostsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Doar administratorii pot genera costuri lunare." };

  const parsed = monthlyCostsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  await generateMonthlyCosts({ ...parsed.data, adminId: admin.id });
  revalidatePath("/administrator/consumuri");
  return INITIAL_STATE;
}

export async function markPaymentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Doar administratorii pot marca plăți." };

  const parsed = markPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  await markPayment({
    apartmentId: parsed.data.apartmentId,
    month: parsed.data.month,
    amount: parsed.data.amount,
    status: parsed.data.status,
    paymentDate: parsed.data.paymentDate || null,
    adminId: admin.id,
  });
  revalidatePath("/administrator/plati");
  return INITIAL_STATE;
}
