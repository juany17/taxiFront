import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { getDriverAvatarSource } from './driver-avatar.util';

describe('getDriverAvatarSource', () => {
  it('returns a Dicebear avatar when a driver has no uploaded photo', () => {
    const source = getDriverAvatarSource({
      id: 'driver-123',
      nombre: 'Conductor de prueba',
      fotoPerfil: '',
    });

    expect(source).toContain('data:image/svg+xml');
  });

  it('produces an image URL Angular can safely bind to an img element', () => {
    const source = getDriverAvatarSource({
      id: 'driver-123',
      nombre: 'Conductor de prueba',
    });

    expect(TestBed.inject(DomSanitizer).sanitize(SecurityContext.URL, source)).toBe(source);
  });

  it('returns the same generated avatar for the same driver', () => {
    const driver = { id: 'driver-123', nombre: 'Conductor', fotoPerfil: undefined };

    expect(getDriverAvatarSource(driver)).toBe(getDriverAvatarSource(driver));
  });

  it('generates a different avatar for a different driver', () => {
    const first = getDriverAvatarSource({ id: 'driver-123', nombre: 'Conductor', fotoPerfil: undefined });
    const second = getDriverAvatarSource({ id: 'driver-456', nombre: 'Conductor', fotoPerfil: undefined });

    expect(first).not.toBe(second);
  });

  it('uses the uploaded photo instead of generating an avatar', () => {
    const photo = 'data:image/webp;base64,uploaded-photo';

    expect(
      getDriverAvatarSource({
        id: 'driver-123',
        nombre: 'Conductor de prueba',
        fotoPerfil: photo,
      }),
    ).toBe(photo);
  });
});
