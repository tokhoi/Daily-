import type { CoupleProfile } from '../types/habit';

export function createDefaultCoupleProfile(): CoupleProfile {
  return {
    myName: '',
    myCode: '',
    partnerName: '',
    partnerCode: '',
    isPaired: false,
    bearStyle: 'pink',
  };
}
