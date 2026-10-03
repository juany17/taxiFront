import { HttpErrorResponse } from '@angular/common/http';
import { getRegistrationErrorMessage, REGISTRATION_PHONE_PATTERN } from './register.component';

describe('getRegistrationErrorMessage', () => {
  it('shows validation details returned by the API', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: ['La contraseña debe tener al menos 8 caracteres'] },
    });
    expect(getRegistrationErrorMessage(error)).toBe(
      'La contraseña debe tener al menos 8 caracteres',
    );
  });

  it('explains when the email is already registered', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { message: 'El correo electrónico ya está registrado' },
    });

    expect(getRegistrationErrorMessage(error)).toBe(
      'El correo electrónico ya está registrado. Inicia sesión o usa otro correo.',
    );
  });

  it('explains when the registration server cannot be reached', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(getRegistrationErrorMessage(error)).toBe(
      'No se pudo conectar con el servidor. Verifica que el backend esté iniciado e intenta de nuevo.',
    );
  });
});

describe('REGISTRATION_PHONE_PATTERN', () => {
  const phonePattern = new RegExp(`^(?:${REGISTRATION_PHONE_PATTERN})$`);

  it('accepts phone numbers with optional country prefix and separators', () => {
    expect(phonePattern.test('+54 388-1234567')).toBeTrue();
  });

  it('rejects letters and phone numbers that are too short', () => {
    expect(phonePattern.test('388abc')).toBeFalse();
    expect(phonePattern.test('123')).toBeFalse();
  });
});
