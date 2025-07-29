// MapView 파일의 test

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

export interface MapViewHandle {
  moveTo: (lat: number, lng: number) => void;
}

const MapView = forwardRef<MapViewHandle>((_, ref) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.naver && window.naver.maps && mapElement.current) {
        mapRef.current = new window.naver.maps.Map(mapElement.current, {
          center: new window.naver.maps.LatLng(37.5665, 126.978),
          zoom: 15,
        });
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // 외부에서 moveTo 호출 가능하게 함
  useImperativeHandle(ref, () => ({
    moveTo(lat, lng) {
      if (mapRef.current) {
        const location = new window.naver.maps.LatLng(lat, lng);
        mapRef.current.setCenter(location);
        new window.naver.maps.Marker({
          map: mapRef.current,
          position: location,
        });
      }
    },
  }));

  return <div ref={mapElement} style={{ width: "100%", height: "500px" }} />;
});

export default MapView;
