// home 파일의 test

import { useRef, useState } from "react";
import AppHeader from "@/components/common/AppHeader";
import MapView, { MapViewHandle } from "@/components/map/MapView";
import { searchBlog } from "@/components/api_blog/naver.blog";
import { geocodeAddress } from "@/components/api_map/naver.geocode";

function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const mapRef = useRef<MapViewHandle>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      // 블로그 검색
      const blogItems = await searchBlog(query);
      setResults(blogItems);

      // 주소 → 좌표 변환
      const geo = await geocodeAddress(query);
      console.log("주소 → 좌표:", geo);

      // 지도 중심 이동 + 마커
      mapRef.current?.moveTo(geo.lat, geo.lng);
    } catch (err) {
      console.error("검색 오류:", err);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <AppHeader />
      <div className="p-4">
        {/* 검색창 */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="맛집 검색어 입력"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            검색
          </button>
        </div>

        {/* 블로그 결과 */}
        <ul className="space-y-4 mb-8">
          {results.map((item, idx) => (
            <li key={idx} className="border-b pb-2">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-bold"
              >
                {item.title.replace(/<[^>]*>?/g, "")}
              </a>
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              <p className="text-xs text-gray-500">
                작성자: {item.bloggername}
              </p>
            </li>
          ))}
        </ul>

        {/* 지도 */}
        <MapView ref={mapRef} />
      </div>
    </div>
  );
}

export default Home;
