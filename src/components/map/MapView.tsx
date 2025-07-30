import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface MapViewHandle {
  moveTo: (lat: number, lng: number) => void;
  routeTo: (
    start: { lat: number; lng: number },
    goal: { lat: number; lng: number },
    onComplete?: (summary: { distance: number; duration: number }) => void
  ) => void;
  clearRoute: () => void;
}

const MapView = forwardRef<MapViewHandle>((_, ref) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeRef = useRef<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const initializeMap = () => {
      if (window.naver?.maps && mapElement.current) {
        mapRef.current = new window.naver.maps.Map(mapElement.current, {
          center: new window.naver.maps.LatLng(37.5665, 126.978),
          zoom: 15,
        });
        // Directions 서비스는 별도로 처리
        console.log("지도 초기화 완료 - Directions API는 별도 호출");
        clearInterval(timer);
      }
    };
    timer = setInterval(initializeMap, 100);
    return () => clearInterval(timer);
  }, []);

  useImperativeHandle(ref, () => {
    const clearRoute = () => {
      console.log(" clearRoute 실행됨");
      if (routeRef.current) {
        routeRef.current.setMap(null);
        routeRef.current = null;
        console.log(" 경로라인이 제거되었습니다");
      }
    };

    return {
      moveTo(lat: number, lng: number) {
        if (!mapRef.current) return;
        // 기존 마커 제거
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        // 지도 중심 이동 및 마커 표시
        const position = new window.naver.maps.LatLng(lat, lng);
        mapRef.current.setCenter(position);
        const marker = new window.naver.maps.Marker({
          position,
          map: mapRef.current,
        });
        markersRef.current.push(marker);
      },
      routeTo(
        start: { lat: number; lng: number },
        goal: { lat: number; lng: number },
        onComplete?: (summary: { distance: number; duration: number }) => void
      ) {
        console.log(" routeTo 호출됨", start, "→", goal);

        if (!mapRef.current) {
          console.error("지도가 초기화되지 않았습니다");
          return;
        }

        clearRoute();

        // 네이버 Directions API 호출 (프록시 사용)
        const clientId = "h52y5k093u";
        const clientSecret = "Kwd07fmmkH3TtVF4ISh21MtkYi7O4dX3GokRCk3w";
        const url = `/map-direction/driving?start=${start.lng},${start.lat}&goal=${goal.lng},${goal.lat}&option=traoptimal`;

        fetch(url, {
          headers: {
            "x-ncp-apigw-api-key-id": clientId,
            "x-ncp-apigw-api-key": clientSecret,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Directions API 응답:", data);

            if (
              data.code === 0 &&
              data.route &&
              data.route.traoptimal &&
              data.route.traoptimal.length > 0
            ) {
              const route = data.route.traoptimal[0];
              const path = route.path.map(
                (point: any) => new window.naver.maps.LatLng(point[1], point[0])
              );

              routeRef.current = new window.naver.maps.Polyline({
                map: mapRef.current,
                path,
                strokeWeight: 5,
                strokeColor: "red",
              });

              console.log(
                "경로라인이 그려졌습니다, segment 개수:",
                path.length
              );

              const summary = route.summary;
              onComplete?.({
                distance: summary.distance, // 미터 단위
                duration: summary.duration, // 밀리초 단위
              });

              console.log("경로 정보:", {
                거리: `${(summary.distance / 1000).toFixed(2)}km`,
                소요시간: `${Math.ceil(summary.duration / 1000 / 60)}분`,
                톨게이트요금: `${summary.tollFare?.toLocaleString()}원`,
                택시요금: `${summary.taxiFare?.toLocaleString()}원`,
                유류비: `${summary.fuelPrice?.toLocaleString()}원`,
              });
            } else {
              console.error("경로 탐색 실패:", data);
              alert(`경로를 찾을 수 없습니다. (코드: ${data.code})`);
            }
          })
          .catch((error) => {
            console.error("Directions API 호출 실패:", error);
            alert("경로 검색 중 오류가 발생했습니다.");
          });
      },
      clearRoute,
    };
  });

  return <div ref={mapElement} style={{ width: "100%", height: "500px" }} />;
});

export default MapView;
