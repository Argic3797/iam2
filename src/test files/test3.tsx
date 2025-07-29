import { useState } from "react";
import AppHeader from "@/components/common/AppHeader";
import MapView from "@/components/map/MapView";
import { searchBlog } from "@/components/api_blog/naver.blog";

function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const data = await searchBlog(query);
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("검색 중 오류 발생");
    }
  };

  return (
    <div>
      <AppHeader />

      <div className="p-4">
        <p className="text-2xl font-semibold mb-2">
          📍 검색어 기반 지도와 블로그 결과 보기
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="맛집 검색"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            검색
          </button>
        </div>

        <MapView />

        <ul className="mt-6 space-y-2">
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
              <p dangerouslySetInnerHTML={{ __html: item.description }} />
              <p className="text-sm text-gray-500">
                작성자: {item.bloggername}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
