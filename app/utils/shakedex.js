// Extract from https://github.com/kurumiimari/shakedex-api/blob/9b6d111afad8b14b4ccf3af7eca4945c3d193bb6/src/service/auctions.js

const jsonSchemaValidate = require('jsonschema').validate;

const hexRegex = (len = null) => {
  return new RegExp(`^[a-f0-9]${len ? `{${len}}` : '+'}$`);
};

const addressRegex = /^(hs|rs|ts|ss)1[a-zA-HJ-NP-Z0-9]{25,39}$/i;

export const fulfillmentSchema = {
  type: 'object',
  required: [
    'broadcastAt',
    'fulfillmentTxHash',
    'lockingPublicKey',
    'name',
    'price',
  ],
  properties: {
    name: {
      type: 'string',
    },
    lockingPublicKey: {
      type: 'string',
      pattern: hexRegex(66),
    },
    fulfillmentTxHash: {
      type: 'string',
      pattern: hexRegex(64),
    },
    price: {
      type: 'integer',
      minimum: 0,
    },
    broadcastAt: {
      type: 'integer',
      minimum: 0,
    },
  }
}

export const auctionSchema = {
  type: 'object',
  required: [
    'name',
    'lockingTxHash',
    'lockingOutputIdx',
    'publicKey',
    'paymentAddr',
    'data',
  ],
  properties: {
    name: {
      type: 'string',
    },
    lockingTxHash: {
      type: 'string',
      pattern: hexRegex(64),
    },
    lockingOutputIdx: {
      type: 'integer',
      minimum: 0,
    },
    publicKey: {
      type: 'string',
      pattern: hexRegex(66),
    },
    paymentAddr: {
      type: 'string',
      pattern: addressRegex,
    },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: [
          'price',
          'lockTime',
          'signature',
        ],
        properties: {
          price: {
            type: 'integer',
            minimum: 0,
          },
          lockTime: {
            type: 'integer',
            minimum: 1610000000,
          },
          signature: {
            type: 'string',
            pattern: hexRegex(130),
          },
        },
      },
    },
  },
};

export const paramSchema = {
  type: 'object',
  required: [
    'durationDays',
    'endPrice',
    'startPrice',
  ],
  properties: {
    durationDays: {
      type: 'integer',
      minimum: 0,
    },
    endPrice: {
      type: 'integer',
      minimum: 0,
    },
    startPrice: {
      type: 'integer',
      minimum: 0,
    },
  },
};

export const finalizeLockScheme = {
  type: 'object',
  required: [
    'broadcastAt',
    'encryptedPrivateKey',
    'finalizeOutputIdx',
    'finalizeTxHash',
    'name',
    'publicKey',
  ],
  properties: {
    broadcastAt: {
      type: 'integer',
    },
    encryptedPrivateKey: {
      type: 'string',
      pattern: hexRegex(160),
    },
    finalizeOutputIdx: {
      type: 'integer',
      minimum: 0,
    },
    finalizeTxHash: {
      type: 'string',
      pattern: hexRegex(64),
    },
    name: {
      type: 'string',
    },
    publicKey: {
      type: 'string',
      pattern: hexRegex(66),
    },
  },
};

export const nameLockSchema = {
  type: 'object',
  required: [
    'broadcastAt',
    'encryptedPrivateKey',
    'lockScriptAddr',
    'name',
    'publicKey',
    'transferTxHash',
  ],
  properties: {
    broadcastAt: {
      type: 'integer',
    },
    encryptedPrivateKey: {
      type: 'string',
      pattern: hexRegex(160),
    },
    lockScriptAddr: {
      type: 'object',
      required: [
        'hash',
        'version',
      ],
      properties: {
        hash: {
          type: 'object',
          required: [
            'data',
            'type',
          ],
          properties: {
            type: {
              type: 'string',
            },
            data: {
              type: 'array',
              items: {
                type: 'integer',
              },
            },
          },
        },
        version: {
          type: 'integer',
        },
      },
    },
    transferTxHash: {
      type: 'string',
      pattern: hexRegex(64),
    },
    name: {
      type: 'string',
    },
    publicKey: {
      type: 'string',
      pattern: hexRegex(66),
    },
  },
};

export async function validateAuction(auction, nodeClient) {
  const res = jsonSchemaValidate(auction, auctionSchema);
  if (!res.valid) {
    throw new Error('Invalid auction schema.');
  }

  // const proofs = auction.data.map(a => new SwapProof({
  //   name: auction.name,
  //   lockingTxHash: auction.lockingTxHash,
  //   lockingOutputIdx: auction.lockingOutputIdx,
  //   publicKey: auction.publicKey,
  //   paymentAddr: auction.paymentAddr,
  //   price: a.price,
  //   lockTime: a.lockTime,
  //   signature: a.signature,
  // }));


  // for (const proof of proofs) {
  //   const ok = await proof.verify({ nodeClient });
  //   if (!ok) {
  //     throw new Error('Swap proofs failed validation.');
  //   }
  // }
}

export function fromAuctionJSON(json) {
  return {
    name: json.name,
    lockingTxHash: json.lockingTxHash,
    lockingOutputIdx: json.lockingOutputIdx,
    publicKey: json.publicKey,
    paymentAddr: json.paymentAddr,
    bids: json.data.map(p => ({
      price: p.price,
      lockTime: `${p.lockTime}`.length === 10
        ? p.lockTime * 1000
        : Math.floor(p.lockTime / 1000) * 1000,
      signature: p.signature,
    })),
  };
}