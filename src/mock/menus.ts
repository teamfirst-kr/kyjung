import { MenuItem } from '../types/menu';

export const mockMenus: MenuItem[] = [
  // b1 파리바게뜨 강남역점
  { id: 'm1', bakeryId: 'b1', name: '버터크로와상', price: 2800, description: '겹겹이 바삭한 프렌치 크로와상', category: '빵', imageEmoji: '🥐', isPopular: true },
  { id: 'm2', bakeryId: 'b1', name: '소보로빵', price: 1800, description: '달콤한 소보로 토핑의 클래식 빵', category: '빵', imageEmoji: '🍞', isPopular: true },
  { id: 'm3', bakeryId: 'b1', name: '딸기생크림케이크', price: 28000, description: '신선한 딸기와 부드러운 생크림', category: '케이크', imageEmoji: '🍰', isPopular: false },
  { id: 'm4', bakeryId: 'b1', name: '아메리카노', price: 2000, description: '깊고 진한 커피', category: '음료', imageEmoji: '☕', isPopular: false },

  // b3 밀도
  { id: 'm5', bakeryId: 'b3', name: '우유식빵', price: 5500, description: '밀도 시그니처 촉촉한 우유식빵', category: '빵', imageEmoji: '🍞', isPopular: true },
  { id: 'm6', bakeryId: 'b3', name: '크림빵', price: 3500, description: '수제 커스터드 크림이 가득', category: '빵', imageEmoji: '🥯', isPopular: true },
  { id: 'm7', bakeryId: 'b3', name: '앙버터', price: 4000, description: '팥앙금과 버터의 완벽한 조화', category: '빵', imageEmoji: '🧈', isPopular: true },
  { id: 'm8', bakeryId: 'b3', name: '소금빵', price: 3000, description: '바삭하고 짭짤한 소금빵', category: '빵', imageEmoji: '🥖', isPopular: false },

  // b4 태극당
  { id: 'm9', bakeryId: 'b4', name: '야채사라다빵', price: 2500, description: '전통 야채 사라다가 들어간 빵', category: '빵', imageEmoji: '🥗', isPopular: true },
  { id: 'm10', bakeryId: 'b4', name: '모나카아이스크림', price: 2000, description: '바삭한 모나카 속 아이스크림', category: '디저트', imageEmoji: '🍦', isPopular: true },
  { id: 'm11', bakeryId: 'b4', name: '단팥빵', price: 2200, description: '달콤한 팥소가 가득', category: '빵', imageEmoji: '🫘', isPopular: true },
  { id: 'm12', bakeryId: 'b4', name: '버터케이크', price: 15000, description: '진한 버터향의 클래식 케이크', category: '케이크', imageEmoji: '🎂', isPopular: false },

  // b5 성심당 서울팝업
  { id: 'm13', bakeryId: 'b5', name: '튀김소보로', price: 2000, description: '성심당 대표 빵! 바삭한 튀김 소보로', category: '빵', imageEmoji: '🍩', isPopular: true },
  { id: 'm14', bakeryId: 'b5', name: '부추빵', price: 2500, description: '부추와 고기소가 가득', category: '빵', imageEmoji: '🥟', isPopular: true },
  { id: 'm15', bakeryId: 'b5', name: '판타롱부추빵', price: 3000, description: '바지 모양의 재미있는 부추빵', category: '빵', imageEmoji: '👖', isPopular: true },
  { id: 'm16', bakeryId: 'b5', name: '망고시루', price: 4500, description: '달콤한 망고 크림 케이크', category: '케이크', imageEmoji: '🥭', isPopular: false },

  // b7 나폴레옹과자점
  { id: 'm17', bakeryId: 'b7', name: '나폴레옹파이', price: 3500, description: '겹겹이 바삭한 시그니처 파이', category: '디저트', imageEmoji: '🥧', isPopular: true },
  { id: 'm18', bakeryId: 'b7', name: '마들렌', price: 2500, description: '버터향 가득한 프렌치 마들렌', category: '디저트', imageEmoji: '🧁', isPopular: true },

  // b8 오월의종
  { id: 'm19', bakeryId: 'b8', name: '고르곤졸라피자빵', price: 4500, description: '고르곤졸라 치즈와 꿀의 조합', category: '빵', imageEmoji: '🍕', isPopular: true },
  { id: 'm20', bakeryId: 'b8', name: '사워도우', price: 8000, description: '72시간 저온 발효 사워도우', category: '빵', imageEmoji: '🥖', isPopular: true },

  // b10 장블랑제리
  { id: 'm21', bakeryId: 'b10', name: '트래디션 바게트', price: 4500, description: '프랑스 정통 방식 바게트', category: '빵', imageEmoji: '🥖', isPopular: true },
  { id: 'm22', bakeryId: 'b10', name: '캉파뉴', price: 12000, description: '프랑스 시골빵 대형 천연발효', category: '빵', imageEmoji: '🍞', isPopular: true },
  { id: 'm23', bakeryId: 'b10', name: '버터크로와상', price: 3500, description: '프랑스 버터 100% 크로와상', category: '빵', imageEmoji: '🥐', isPopular: false },

  // b12 런던베이글뮤지엄
  { id: 'm24', bakeryId: 'b12', name: '플레인베이글', price: 3500, description: '쫄깃한 수제 베이글', category: '빵', imageEmoji: '🥯', isPopular: true },
  { id: 'm25', bakeryId: 'b12', name: '크림치즈 스프레드', price: 2500, description: '수제 크림치즈', category: '토핑', imageEmoji: '🧀', isPopular: true },
  { id: 'm26', bakeryId: 'b12', name: '시나몬베이글', price: 4000, description: '시나몬 향 가득한 베이글', category: '빵', imageEmoji: '🥯', isPopular: true },

  // b13 소월길브레드
  { id: 'm27', bakeryId: 'b13', name: '탕종식빵', price: 6000, description: '탕종법으로 만든 촉촉한 식빵', category: '빵', imageEmoji: '🍞', isPopular: true },
  { id: 'm28', bakeryId: 'b13', name: '얼그레이스콘', price: 3500, description: '얼그레이 향 겉바속촉 스콘', category: '디저트', imageEmoji: '🫖', isPopular: true },

  // b15 앙트레
  { id: 'm29', bakeryId: 'b15', name: '깐넬레', price: 3000, description: '캐러멜 바삭 속촉 프렌치 디저트', category: '디저트', imageEmoji: '🍮', isPopular: true },
  { id: 'm30', bakeryId: 'b15', name: '에클레어', price: 4500, description: '초코 에클레어 수제 크림', category: '디저트', imageEmoji: '🍫', isPopular: true },

  // b2 뚜레쥬르 홍대입구점
  { id: 'm31', bakeryId: 'b2', name: '모닝세트', price: 5500, description: '빵2개+음료 모닝세트', category: '세트', imageEmoji: '🌅', isPopular: true },
  { id: 'm32', bakeryId: 'b2', name: '바게트', price: 3500, description: '매일 구워내는 바게트', category: '빵', imageEmoji: '🥖', isPopular: false },

  // b6 파리바게뜨 신촌점
  { id: 'm33', bakeryId: 'b6', name: '소시지빵', price: 2500, description: '통소시지가 들어간 인기 빵', category: '빵', imageEmoji: '🌭', isPopular: true },
  { id: 'm34', bakeryId: 'b6', name: '카스테라', price: 8000, description: '폭신폭신 수제 카스테라', category: '케이크', imageEmoji: '🧁', isPopular: false },

  // b9 CU 베이커리
  { id: 'm35', bakeryId: 'b9', name: '크림치즈빵', price: 1800, description: '크림치즈가 듬뿍', category: '빵', imageEmoji: '🧀', isPopular: true },
  { id: 'm36', bakeryId: 'b9', name: '허니버터빵', price: 1500, description: '달콤한 허니버터 토핑', category: '빵', imageEmoji: '🍯', isPopular: true },

  // b11 뚜레쥬르 잠실롯데점
  { id: 'm37', bakeryId: 'b11', name: '브리오슈', price: 3500, description: '버터향 가득 브리오슈', category: '빵', imageEmoji: '🧈', isPopular: true },
  { id: 'm38', bakeryId: 'b11', name: '치아바타 샌드위치', price: 6500, description: '치아바타에 햄치즈 샌드위치', category: '샌드위치', imageEmoji: '🥪', isPopular: false },

  // b14 파리바게뜨 여의도점
  { id: 'm39', bakeryId: 'b14', name: '단팥빵', price: 2000, description: '달콤한 팥앙금 가득', category: '빵', imageEmoji: '🫘', isPopular: true },
  { id: 'm40', bakeryId: 'b14', name: '마늘바게트', price: 3500, description: '마늘소스 듬뿍 바게트', category: '빵', imageEmoji: '🧄', isPopular: true },
];
