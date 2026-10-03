import { createAvatar } from '@dicebear/core';
import {
  create as createAdventurerNeutral,
  meta as adventurerNeutralMeta,
  schema as adventurerNeutralSchema,
} from '@dicebear/adventurer-neutral';
import type { Options as AdventurerNeutralOptions } from '@dicebear/adventurer-neutral';

const adventurerNeutral = {
  create: createAdventurerNeutral,
  meta: adventurerNeutralMeta,
  schema: adventurerNeutralSchema,
};

type DriverAvatarData = {
  id: string;
  nombre: string;
  fotoPerfil?: string | null;
};

export function getDriverAvatarSource(driver: DriverAvatarData): string {
  const uploadedPhoto = driver.fotoPerfil?.trim();
  if (uploadedPhoto) {
    return uploadedPhoto;
  }

  const seed = driver.id || driver.nombre.trim() || 'conductor';
  return createAvatar<AdventurerNeutralOptions>(adventurerNeutral, { seed }).toDataUri();
}
