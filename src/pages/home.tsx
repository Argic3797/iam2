import { useState, useRef, useEffect } from "react";
import AppHeader from "@/components/common/AppHeader";
import MapView from "@/components/map/MapView";
import type { MapViewHandle } from "@/components/map/MapView";
import { geocodeAddress } from "@/components/api_map/naver.geoMap";
import { searchPlace } from "@/components/api_blog/naver.location";

function Home() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const mapRef = useRef<MapViewHandle>(null);
  const [myPos, setMyPos] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);

  const [selectedDest, setSelectedDest] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation 지원 안 함");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        setMyPos({ lat: latitude, lng: longitude, accuracy });

        // mapRef가 준비될 때까지 재시도
        const tryMove = () => {
          if (mapRef.current) {
            mapRef.current.moveTo(latitude, longitude);
          } else {
            setTimeout(tryMove, 200);
          }
        };
        tryMove();
      },
      (err) => {
        console.error("내 위치 가져오기 실패:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    try {
      const data = await searchPlace(query);
      console.log("검색 결과:", data);

      if (!data || data.length === 0) {
        alert("검색 결과가 없습니다.");
        return;
      }

      setPlaces(data);

      if (data.length > 0) {
        const first = data[0];
        if (first.mapx && first.mapy) {
          const x = parseFloat(first.mapx) / 10000000;
          const y = parseFloat(first.mapy) / 10000000;

          // 지도를 해당 위치로 이동
          if (mapRef.current) {
            mapRef.current.moveTo(y, x);
          }
        }
      }
    } catch (err) {
      console.error("검색 오류:", err);
      alert(
        "장소 검색 중 오류 발생: " +
          (err instanceof Error ? err.message : "알 수 없는 오류")
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />

      {myPos && (
        <div className="absolute top-20 right-4 bg-white p-2 rounded shadow">
          <div>
            내 위치: {myPos.lat.toFixed(6)}, {myPos.lng.toFixed(6)}
          </div>
          {myPos.accuracy && (
            <div className="text-sm text-gray-600">
              정확도: ±{Math.round(myPos.accuracy)}m
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <p className="text-2xl font-semibold mb-2">
          업체명 기반 장소 검색 및 지도 표시
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 강남구청"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            검색
          </button>
        </div>

        <MapView ref={mapRef} />

        <button
          onClick={() => {
            if (!myPos || !selectedDest) {
              return alert("출발지(내 위치)와 도착지를 모두 선택해주세요.");
            }

            console.log("경로 검색 시작:", {
              출발지: { lat: myPos.lat, lng: myPos.lng },
              도착지: { lat: selectedDest.lat, lng: selectedDest.lng },
            });

            try {
              mapRef.current?.routeTo(
                { lat: myPos.lat, lng: myPos.lng },
                { lat: selectedDest.lat, lng: selectedDest.lng },
                (summary) => {
                  console.log("경로 검색 완료:", summary);
                  setRouteInfo(summary);
                }
              );
            } catch (error) {
              console.error("경로 검색 버튼 오류:", error);
              alert("경로 검색 중 오류가 발생했습니다.");
            }
          }}
          disabled={!selectedDest}
          className={`mt-2 px-4 py-2 rounded text-white ${
            selectedDest ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          최적 경로 검색
        </button>
        {/*  경로 요약 UI(direction 5) 근데 뒤지게 안됨 */}
        {routeInfo && (
          <div className="p-4 bg-white rounded shadow mt-4">
            <p>총 거리: {(routeInfo.distance / 1000).toFixed(2)} km</p>
            <p>소요 시간: {Math.ceil(routeInfo.duration / 1000 / 60)} 분</p>
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {places.map((item, idx) => (
            <li
              key={idx}
              className="border-b pb-2 cursor-pointer hover:bg-gray-100"
              onClick={async () => {
                try {
                  console.log("선택된 장소:", item);

                  // 이미 좌표가 있는 경우 사용
                  if (item.mapx && item.mapy) {
                    // 네이버 좌표를 올바른 형식으로 변환 (문자열을 소수점 좌표로)
                    const rawLat = parseFloat(item.mapy);
                    const rawLng = parseFloat(item.mapx);
                    const lat = rawLat / 10000000;
                    const lng = rawLng / 10000000;

                    console.log("원본 좌표:", { rawLat, rawLng });
                    console.log("변환된 좌표:", { lat, lng });

                    mapRef.current?.moveTo(lat, lng);
                    setSelectedDest({ lat, lng });
                    console.log("좌표 사용:", { lat, lng });
                    return;
                  }

                  // 좌표가 없는 경우 주소로 변환
                  const coords = await geocodeAddress(item.roadAddress);
                  mapRef.current?.moveTo(coords.lat, coords.lng);
                  setSelectedDest({ lat: coords.lat, lng: coords.lng });
                  console.log("주소 변환 결과:", coords);
                } catch (error) {
                  console.error("주소 변환 실패:", error);
                  alert(
                    "선택한 장소의 좌표를 가져올 수 없습니다: " +
                      (error instanceof Error
                        ? error.message
                        : "알 수 없는 오류")
                  );
                }
              }}
            >
              <h3 className="text-xl font-bold">
                {item.title.replace(/<[^>]*>?/g, "")}
              </h3>
              <p>주소: {item.roadAddress}</p>
              <p className="text-sm text-gray-500">전화: {item.telephone}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                네이버 상세 페이지
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
