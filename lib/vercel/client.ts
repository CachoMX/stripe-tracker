const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

const VERCEL_API_BASE = 'https://api.vercel.com';

interface VercelDomainResponse {
  name: string;
  verified: boolean;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
}

export async function addDomainToVercel(domain: string): Promise<VercelDomainResponse> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel API credentials not configured');
  }

  const url = `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains${
    VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  }`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: domain,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to add domain to Vercel');
  }

  return response.json();
}

export async function verifyDomainInVercel(domain: string): Promise<VercelDomainResponse> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel API credentials not configured');
  }

  const url = `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify${
    VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  }`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to verify domain in Vercel');
  }

  return response.json();
}

export async function removeDomainFromVercel(domain: string): Promise<void> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel API credentials not configured');
  }

  const url = `${VERCEL_API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${
    VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  }`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to remove domain from Vercel');
  }
}
