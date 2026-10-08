import dns from 'node:dns';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'trashmail.com',
  'yopmail.com',
  'dispostable.com',
  'getnada.com',
]);

export async function validateEmailAddress(rawEmail: string): Promise<{ isValid: boolean; reason?: string; email: string }> {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { isValid: false, reason: 'Email is required', email: '' };
  }

  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: 'Please enter a valid email address format', email };
  }

  const [, domain] = email.split('@');
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, reason: 'Disposable email addresses are not allowed', email };
  }

  try {
    const resolvePromise = dns.promises.resolveMx(domain);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS MX resolution timeout')), 3000)
    );

    const mxRecords = await Promise.race([resolvePromise, timeoutPromise]);
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, reason: 'Email domain does not accept mail (no MX records found)', email };
    }
  } catch (error: any) {
    // Fail open on DNS timeout or lookup error, but log it
    console.warn(`[Email Validation Warning] MX lookup skipped or failed for ${domain}: ${error.message}`);
  }

  return { isValid: true, email };
}
