export async function geocodeAddress(address: string) {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_NAVER_MAP_CLIENT_SECRET;
  const encoded = encodeURIComponent(address);

  // ── v1 Geocoding 엔드포인트 사용
  const url = `/map-geocode/v2/geocode?query=${encoded}`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding 실패: ${res.status}`);
  }

  const data = await res.json();
  const point = data.addresses?.[0];
  if (!point) {
    throw new Error("주소 결과 없음");
  }

  return {
    lat: parseFloat(point.y),
    lng: parseFloat(point.x),
    roadAddress: point.roadAddress || point.jibunAddress,
  };
}
