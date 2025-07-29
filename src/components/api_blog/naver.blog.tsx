export async function searchBlog(query: string) {
  const clientId = "p6fsDAOMW0EARgs_zxk_";
  const clientSecret = "1rbtmSXX6V";

  const encodedQuery = encodeURIComponent(query);
  const url = `/v1/search/blog?query=${encodedQuery}`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    throw new Error(`블로그 검색 실패: ${res.status}`);
  }

  const data = await res.json();
  return data.items;
}
