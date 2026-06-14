// ============================================================================
// Wuwa Archive — Import Parse API Route
// Thin proxy to Kuro Games API with proper field handling
// Server does NOT store any data — zero data retention
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import type { KuroApiPull, ConveneUrlParams } from '@/lib/api/types';

// === URL Validation ===
const CONVENE_URL_REGEX = /^https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?/;

function extractUrlParams(url: string): ConveneUrlParams {
  const hashPart = url.split('#/record?')[1];
  if (!hashPart) throw new Error('INVALID_URL_FORMAT');

  const params = new URLSearchParams(hashPart);
  const playerId = params.get('player_id');
  const recordId = params.get('record_id');
  const serverId = params.get('svr_id');
  const languageCode = params.get('lang') || 'en';
  const svrArea = params.get('svr_area') || 'global';

  if (!playerId || !recordId || !serverId) {
    throw new Error('MISSING_PARAMS');
  }

  return { playerId, recordId, serverId, languageCode, svrArea };
}

// === Kuro API Proxy ===
const KURO_API_GLOBAL = 'https://gmserver-api.aki-game2.net/gacha/record/query';
const KURO_API_CN = 'https://gmserver-api.aki-game2.com/gacha/record/query';
const MAX_PAGES = 50;       // Safety limit to prevent infinite loops
const PAGE_SIZE = 20;       // Kuro API default page size
const PAGE_DELAY_MS = 300;  // Delay between pages to avoid rate limiting

async function fetchBannerPulls(
  params: ConveneUrlParams,
  cardPoolType: number
): Promise<KuroApiPull[]> {
  const allPulls: KuroApiPull[] = [];
  const apiUrl = params.svrArea === 'cn' ? KURO_API_CN : KURO_API_GLOBAL;
  let prevFirstItem: string | null = null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = {
      cardPoolType,
      playerId: params.playerId,
      serverId: params.serverId,
      languageCode: params.languageCode,
      recordId: params.recordId,
      page,
      size: PAGE_SIZE,
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`KURO_API_HTTP_${res.status}`);
    }

    const json = await res.json();

    // Kuro API returns code !== 0 for errors (including expired tokens)
    if (json.code !== 0) {
      throw new Error(`KURO_API_CODE_${json.code}`);
    }

    // CRITICAL: Kuro API returns data directly as array, NOT data.list
    const list: KuroApiPull[] = Array.isArray(json.data)
      ? json.data
      : (json.data?.list ?? []);

    if (!list || list.length === 0) break;

    // Anti-infinite-loop: check if first item is same as previous page
    const currentFirstItem = JSON.stringify(list[0]);
    if (currentFirstItem === prevFirstItem) {
      break; // API is returning duplicate data — stop pagination
    }
    prevFirstItem = currentFirstItem;

    allPulls.push(...list);

    // If we got fewer items than page size, this is the last page
    if (list.length < PAGE_SIZE) break;

    // Rate limiting delay between pages
    await new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));
  }

  return allPulls;
}

// === Route Handler ===
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate URL format
    if (!body.conveneUrl || !CONVENE_URL_REGEX.test(body.conveneUrl)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_URL', message: 'URL format is not valid.' },
        { status: 400 }
      );
    }

    // 2. Validate cardPoolType (must be 1-10)
    if (!body.cardPoolType || body.cardPoolType < 1 || body.cardPoolType > 10) {
      return NextResponse.json(
        { success: false, error: 'INVALID_POOL_TYPE' },
        { status: 400 }
      );
    }

    // 3. Extract URL params
    const params = extractUrlParams(body.conveneUrl);

    // 4. Fetch pulls from Kuro API for this banner
    const pulls = await fetchBannerPulls(params, body.cardPoolType);

    // 5. Return raw data — normalization happens client-side
    //    Server does NOT store anything
    return NextResponse.json({
      success: true,
      playerUid: params.playerId,
      serverId: params.serverId,
      serverArea: params.svrArea,
      cardPoolType: body.cardPoolType,
      pulls,
      pullCount: pulls.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    // Token expired detection
    if (message.includes('KURO_API_CODE')) {
      return NextResponse.json(
        {
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'URL has expired. Open Convene History in-game and run the script again to get a new URL.',
        },
        { status: 401 }
      );
    }

    // Network errors
    if (message.includes('KURO_API_HTTP')) {
      return NextResponse.json(
        {
          success: false,
          error: 'KURO_API_ERROR',
          message: 'The game server is having issues. Please try again later.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
