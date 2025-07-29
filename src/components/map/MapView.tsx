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
  const directionsServiceRef = useRef<any>(null);
  const routeRef = useRef<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const initializeMap = () => {
      if (window.naver?.maps && mapElement.current) {
        mapRef.current = new window.naver.maps.Map(mapElement.current, {
          center: new window.naver.maps.LatLng(37.5665, 126.978),
          zoom: 15,
        });
        // Directions 서비스 초기화 (타입 안전성 확보)
        const Service = (window as any).naver.maps.Service;
        if (Service?.Directions) {
          directionsServiceRef.current = new Service.Directions();
        }
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
        if (!directionsServiceRef.current || !mapRef.current) return;
        clearRoute();
        directionsServiceRef.current.route(
          {
            start: new window.naver.maps.LatLng(start.lat, start.lng),
            goal: new window.naver.maps.LatLng(goal.lat, goal.lng),
          },
          (status: any, response: any) => {
            console.log(" 길찾기 응답 수신, status:", status);
            if (
              status === window.naver.maps.Service.Status.OK &&
              response.routes?.length
            ) {
              const path = response.routes[0].path.map(
                (p: any) => new window.naver.maps.LatLng(p.y, p.x)
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
              const summary = response.routes[0].summary;
              onComplete?.({
                distance: summary.distance, //  meters
                duration: summary.duration, //  seconds
              });
            } else {
              console.error("경로 탐색 실패:", status, response);
            }
          }
        );
      },
      clearRoute,
    };
  });

  return <div ref={mapElement} style={{ width: "100%", height: "500px" }} />;
});

export default MapView;
