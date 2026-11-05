// The invitation URL a referral code resolves to. Screens that show the code
// still hand out this link, so the host lives in one place.
const INVITE_BASE = 'https://namaaplikasi.com/ref/';

export const inviteLink = (code) => (code ? `${INVITE_BASE}${code}` : '');
