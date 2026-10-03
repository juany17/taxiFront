import { getPassengerTripDialogState, shouldApplyPassengerTripStatus } from './home.component';

describe('getPassengerTripDialogState', () => {
  it('shows waiting while the request is pending', () => {
    expect(getPassengerTripDialogState('pendiente')).toBe('waiting');
  });

  describe('shouldApplyPassengerTripStatus', () => {
    it('does not let a stale pending response hide the accepted-trip dialog', () => {
      expect(shouldApplyPassengerTripStatus('aceptado', 'pendiente')).toBeFalse();
    });

    it('allows the completed status to replace accepted', () => {
      expect(shouldApplyPassengerTripStatus('aceptado', 'finalizado')).toBeTrue();
    });
  });

  it('shows driver details after a driver accepts', () => {
    expect(getPassengerTripDialogState('aceptado')).toBe('accepted');
  });

  it('asks for a review only after the trip is finished', () => {
    expect(getPassengerTripDialogState('finalizado')).toBe('review');
  });
});
