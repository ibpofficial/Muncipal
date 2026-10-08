export interface SeverityResult {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  reasons: string[];
}

export function calculateSeverity(description: string): SeverityResult {
  const desc = description.toLowerCase();
  const reasons: string[] = [];

  let score = 30; // base low score
  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

  // Rule 1: CRITICAL signals
  const criticalSignals = [
    { pattern: /open manhole|missing cover|manhole cover/i, text: 'Open manhole / missing cover safety hazard', points: 65 },
    { pattern: /road collapse|sinkhole|structural failure|cave-in/i, text: 'Catastrophic road structural collapse detected', points: 65 },
    { pattern: /completely blocked|total obstruction|impassable/i, text: 'Road completely blocked to all transit', points: 55 },
    { pattern: /severe accident|fatal hazard|life threatening/i, text: 'Immediate severe accident hazard reported', points: 60 },
  ];

  // Rule 2: HIGH signals
  const highSignals = [
    { pattern: /deep pothole|large pothole|massive crater/i, text: 'Large/deep pothole structural damage', points: 40 },
    { pattern: /dangerous|crash risk|accident risk/i, text: 'High risk of vehicle accidents', points: 35 },
    { pattern: /lane blocked|partially blocked/i, text: 'Traffic lane obstruction detected', points: 30 },
    { pattern: /two-wheeler|bike hazard|scooter danger/i, text: 'Potential two-wheeler safety risk', points: 35 },
  ];

  // Rule 3: MEDIUM signals
  const mediumSignals = [
    { pattern: /pothole|broken road|damaged surface|surface breakdown/i, text: 'Standard pothole / road surface breakdown', points: 25 },
    { pattern: /road crack|surface crack|large crack/i, text: 'Moderate road surface cracking', points: 20 },
    { pattern: /rough road|uneven pavement/i, text: 'Uneven surface condition', points: 15 },
  ];

  // Rule 4: LOW signals
  const lowSignals = [
    { pattern: /small pothole|minor crack|slight damage|cosmetic/i, text: 'Minor surface defect / small crack', points: 10 },
  ];

  let matchedCritical = false;
  let matchedHigh = false;
  let matchedMedium = false;

  for (const sig of criticalSignals) {
    if (sig.pattern.test(desc)) {
      score += sig.points;
      reasons.push(sig.text);
      matchedCritical = true;
    }
  }

  for (const sig of highSignals) {
    if (sig.pattern.test(desc)) {
      score += sig.points;
      reasons.push(sig.text);
      matchedHigh = true;
    }
  }

  for (const sig of mediumSignals) {
    if (sig.pattern.test(desc)) {
      score += sig.points;
      reasons.push(sig.text);
      matchedMedium = true;
    }
  }

  for (const sig of lowSignals) {
    if (sig.pattern.test(desc)) {
      score += sig.points;
      reasons.push(sig.text);
    }
  }

  // Cap score 0 - 100
  score = Math.min(100, Math.max(10, score));

  if (matchedCritical || score >= 85) {
    severity = 'CRITICAL';
    if (reasons.length === 0) reasons.push('Severe structural road damage');
  } else if (matchedHigh || score >= 65) {
    severity = 'HIGH';
    if (reasons.length === 0) reasons.push('High-severity road damage detected');
  } else if (matchedMedium || score >= 40) {
    severity = 'MEDIUM';
    if (reasons.length === 0) reasons.push('Moderate pavement breakdown');
  } else {
    severity = 'LOW';
    if (reasons.length === 0) reasons.push('Minor surface issue reported');
  }

  return { severity, score, reasons };
}
