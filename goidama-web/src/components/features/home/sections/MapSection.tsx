'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LocateFixed, MapPin, Calendar, User2, X, ChevronRight, Sparkles } from 'lucide-react';
import { capsuleService } from '@/services/capsule.service';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';

export default function MapSection() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const router = useRouter();
  
  const [allCapsules, setAllCapsules] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<any>(null);

  const filters = ['전체', '잠긴 캡슐', '열린 캡슐'];

  // 1. 지도 초기화 및 데이터 로드
  const initMap = (lat: number, lng: number) => {
    if (!window.kakao || !mapContainer.current || mapInstance.current) return;
    window.kakao.maps.load(async () => {
      const options = { center: new window.kakao.maps.LatLng(lat, lng), level: 4 };
      const map = new window.kakao.maps.Map(mapContainer.current, options);
      mapInstance.current = map;
      await fetchCapsuleData();
      window.kakao.maps.event.addListener(map, 'click', () => setSelectedCapsule(null));
      setIsLoading(false);
    });
  };

  const fetchCapsuleData = async () => {
    try {
      const capsules = await capsuleService.getMap();
      setAllCapsules(capsules || []);
    } catch (error) { console.error(error); }
  };

  const filteredCapsules = useMemo(() => {
    return allCapsules.filter((cap) => {
      const status = cap.status?.toUpperCase();
      if (activeFilter === '잠긴 캡슐') return !cap.is_group;
      if (activeFilter === '열린 캡슐') return status === 'OPENED';
      return true;
    });
  }, [allCapsules, activeFilter]);

  // 2. 마커 렌더링
  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    filteredCapsules.forEach((cap) => {
      const isOpened = cap.status?.toUpperCase() === 'OPENED';
      const markerImageUrl = `/images/skins/skin-${cap.skin_id || 1}-${isOpened ? 'opened' : 'locked'}.png`;
      
      const imageSize = new window.kakao.maps.Size(84, 84); // 마커 크기 적정화
      const markerImg = new window.kakao.maps.MarkerImage(markerImageUrl, imageSize);
      
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(cap.latitude, cap.longitude),
        map: mapInstance.current,
        image: markerImg,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedCapsule(cap);
        mapInstance.current.panTo(new window.kakao.maps.LatLng(cap.latitude, cap.longitude));
      });
      markersRef.current.push(marker);
    });
  }, [filteredCapsules]);

  const handleReCenter = () => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstance.current) mapInstance.current.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        setIsGpsLoading(false);
      },
      () => setIsGpsLoading(false)
    );
  };

  useEffect(() => {
    const checkSdk = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        initMap(37.5665, 126.9780);
        handleReCenter();
        clearInterval(checkSdk);
      }
    }, 100);
    return () => clearInterval(checkSdk);
  }, []);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false`} strategy="afterInteractive" />

      {/* ── 상단 필터 칩 ── */}
      <div className="absolute top-6 left-0 right-0 z-20 px-6 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-card border ${
              activeFilter === filter 
                ? 'bg-brand-lavender-600 text-white border-transparent' 
                : 'bg-white/90 backdrop-blur-md text-brand-subtext border-brand-lavender-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div ref={mapContainer} className="w-full h-full z-0" />

      {/* ── 현재 위치 버튼 ── */}
      <div className="absolute right-5 bottom-32 z-20">
        <button 
          onClick={handleReCenter} 
          className="w-12 h-12 bg-white rounded-2xl shadow-card flex items-center justify-center text-brand-lavender-600 border border-brand-lavender-100 active:scale-90 transition-all"
        >
          <LocateFixed size={22} strokeWidth={2.2} className={isGpsLoading ? 'animate-pulse' : ''} />
        </button>
      </div>

      {/* ── 하단 상세 카드 ── */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-5">
        <AnimatePresence>
          {selectedCapsule && (
            <motion.div 
              key="detail-card"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white p-6 rounded-[32px] shadow-card border border-brand-lavender-100 relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      selectedCapsule.is_group ? 'bg-brand-lavender-50 text-brand-lavender-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {selectedCapsule.is_group ? '공동' : '개인'}
                    </span>
                    <h4 className="text-[18px] font-bold text-brand-text truncate">{selectedCapsule.title}</h4>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-lavender-600">
                      <Calendar size={14} />
                      <span>{new Date(selectedCapsule.open_at).toLocaleDateString('ko-KR')} 고이 열림</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-brand-subtext font-medium">
                      <MapPin size={14} />
                      <span className="truncate">{selectedCapsule.address || '장소 정보 없음'}</span>
                    </div>
                  </div>
                </div>

                {/* 캡슐 이미지 썸네일 */}
                <div className="w-24 h-24 bg-brand-lavender-50 rounded-2xl flex items-center justify-center shrink-0 border border-brand-lavender-100 relative shadow-inner">
                  <Sparkles className="absolute top-2 right-2 text-brand-lavender-200" size={12} />
                  <img 
                    src={`/images/skins/skin-${selectedCapsule.skin_id || 1}-${selectedCapsule.status?.toLowerCase() === 'opened' ? 'opened' : 'locked'}.png`}
                    className="w-32 h-32 object-contain drop-shadow-md"
                    alt="capsule"
                  />
                </div>
              </div>

              {/* 하단 액션 바 */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-brand-lavender-50">
                <div className="flex -space-x-2">
                  {(selectedCapsule.participants || []).slice(0, 3).map((p: any, i: number) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-brand-surface flex items-center justify-center overflow-hidden shadow-sm">
                      {p.profile_image_url ? <img src={p.profile_image_url} className="w-full h-full object-cover" /> : <User2 size={12} className="text-brand-light" />}
                    </div>
                  ))}
                  {(selectedCapsule.participants || []).length > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-brand-lavender-50 flex items-center justify-center text-[10px] font-bold text-brand-lavender-600 z-10">
                      +{(selectedCapsule.participants || []).length - 3}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => router.push(`/capsule/${selectedCapsule.id}`)}
                  className="bg-brand-lavender-600 text-white px-6 py-3 rounded-2xl text-[14px] font-bold active:scale-95 transition-all shadow-lg shadow-brand-lavender-600/20 flex items-center gap-2"
                >
                  추억 확인하기
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}