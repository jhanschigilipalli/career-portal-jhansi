/** Recruiter invite link validity (minutes). */
const RECRUITER_INVITE_TTL_MINUTES = 30;

function recruiterInviteExpiresAt() {
  return new Date(Date.now() + RECRUITER_INVITE_TTL_MINUTES * 60 * 1000);
}

function isRecruiterInviteExpired(invite) {
  if (!invite?.expires_at) return false;
  return new Date() > new Date(invite.expires_at);
}

function recruiterInviteExpiryEmailNote() {
  return `This link will expire in ${RECRUITER_INVITE_TTL_MINUTES} minutes.`;
}

module.exports = {
  RECRUITER_INVITE_TTL_MINUTES,
  recruiterInviteExpiresAt,
  isRecruiterInviteExpired,
  recruiterInviteExpiryEmailNote,
};
