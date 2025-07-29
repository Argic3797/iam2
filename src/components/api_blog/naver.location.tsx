export async function searchPlace(query: string) {
  const clientId = import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET;

  const encodedQuery = encodeURIComponent(query);
  const url = `/v1/search/local.json?query=${encodedQuery}&display=5`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    throw new Error(`장소 검색 실패: ${res.status}`);
  }

  const data = await res.json();
  return data.items; // array of places
}
