export interface Block {
  id: string;
  name: string;
  address: string;
}

export interface Staircase {
  id: string;
  blockId: string;
  name: string;
}

export interface Apartment {
  id: string;
  staircaseId: string;
  blockId: string;
  number: string;
  floor: number | null;
}

export interface Resident {
  id: string;
  userId: string;
  apartmentId: string;
  movedInAt: string;
  movedOutAt: string | null;
}
