export interface AgeResult {
  score: number;
  daysPending: number;
  reason: string;
}

export function calculateAgeScore(reportedAt: Date | string): AgeResult {
  const reportedDate = new Date(reportedAt);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - reportedDate.getTime());
  const daysPending = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let score = 20;
  let reason = 'Recently reported complaint (< 24 hrs)';

  if (daysPending >= 15) {
    score = 100;
    reason = `Critical backlog delay (${daysPending} days unresolved)`;
  } else if (daysPending >= 8) {
    score = 80;
    reason = `High pending duration (${daysPending} days awaiting repair)`;
  } else if (daysPending >= 4) {
    score = 60;
    reason = `Moderate age (${daysPending} days open in queue)`;
  } else if (daysPending >= 2) {
    score = 40;
    reason = `Complaint pending for ${daysPending} days`;
  }

  return { score, daysPending, reason };
}
