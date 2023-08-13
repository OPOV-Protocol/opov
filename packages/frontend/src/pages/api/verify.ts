// pages/api/fetchData.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { credential, signal } = req.body; // Extracting an argument from the query
  console.log('handleVerify: credential', credential, 'address', signal);

  const response = await fetch('https://developer.worldcoin.org/v1/verify/?app_id=app_staging_465fadc3db6afe30e7b43ea029771dcd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // @ts-ignore
      nullifier_hash: credential.nullifier_hash,
      // @ts-ignore
      merkle_root: credential.merkle_root,
      // @ts-ignore
      proof: credential.proof,
      credential_type: 'orb',
      action: 'pop-verification',
      signal,
    }),
  })

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    console.log(message);
    throw new Error(message);
  }

  const data = await response.json();
  res.status(200).json(data);
};
