'use server';

import { z } from 'zod';

const schema = z.object({
  mcc: z.coerce.number(),
  mnc: z.coerce.number(),
  lac: z.coerce.number(),
  cid: z.coerce.number(),
});

export async function getLocationFromCell(input: {
  mcc: number;
  mnc: number;
  lac: number;
  cid: number;
}): Promise<{ success: boolean; lat?: number; lon?: number; message: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Invalid cell tower data.' };
  }

  const apiKey = process.env.UNWIRED_API_KEY;
  if (!apiKey) {
    console.error('Unwired Labs API key is not configured.');
    return { success: false, message: 'Location service is not configured. API key missing.' };
  }

  try {
    const response = await fetch('https://us1.unwiredlabs.com/v2/process.php', {
      method: 'POST',
      body: JSON.stringify({
        token: apiKey,
        radio: 'gsm',
        mcc: parsed.data.mcc,
        mnc: parsed.data.mnc,
        cells: [
          {
            lac: parsed.data.lac,
            cid: parsed.data.cid,
          },
        ],
        address: 1,
      }),
    });

    const data = await response.json();

    if (data.status === 'ok') {
      return {
        success: true,
        lat: data.lat,
        lon: data.lon,
        message: 'Location found successfully.',
      };
    } else {
      console.error('Unwired Labs API Error:', data.message);
      return { success: false, message: data.message || 'Could not retrieve location from provider.' };
    }
  } catch (error) {
    console.error('Error calling Unwired Labs API:', error);
    return { success: false, message: 'An error occurred while fetching location.' };
  }
}
