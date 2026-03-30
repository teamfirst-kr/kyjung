import { Review } from '../types/review';

export const mockReviews: Review[] = [
  // b1 파리바게뜨 강남역점
  { id: 'r1', bakeryId: 'b1', userName: '빵순이', rating: 4, content: '크로와상이 바삭하고 맛있어요! 출근길에 항상 들려요.', date: '2026-03-25', helpful: 12 },
  { id: 'r2', bakeryId: 'b1', userName: '강남직장인', rating: 4, content: '위치가 좋고 빵 종류가 다양해요. 점심시간에 사람 많아요.', date: '2026-03-20', helpful: 8 },
  { id: 'r3', bakeryId: 'b1', userName: '달콤이', rating: 5, content: '케이크 주문했는데 너무 예쁘게 만들어주셨어요!', date: '2026-03-15', helpful: 15 },

  // b2 뚜레쥬르 홍대입구점
  { id: 'r4', bakeryId: 'b2', userName: '홍대러버', rating: 4, content: '모닝빵 세트가 아침식사로 딱이에요.', date: '2026-03-22', helpful: 6 },
  { id: 'r5', bakeryId: 'b2', userName: '맛집탐방', rating: 4, content: '시즌 한정 딸기 케이크 맛있어요!', date: '2026-03-18', helpful: 10 },

  // b3 밀도
  { id: 'r6', bakeryId: 'b3', userName: '식빵덕후', rating: 5, content: '우유식빵 진짜 최고... 줄 서서 먹을 가치 있어요.', date: '2026-03-27', helpful: 45 },
  { id: 'r7', bakeryId: 'b3', userName: '북촌산책', rating: 5, content: '크림빵이 너무 부드럽고 크림이 가득해요. 감동.', date: '2026-03-24', helpful: 32 },
  { id: 'r8', bakeryId: 'b3', userName: '빵투어', rating: 5, content: '앙버터 먹으러 매주 와요. 버터향이 환상적!', date: '2026-03-20', helpful: 28 },
  { id: 'r9', bakeryId: 'b3', userName: '관광객', rating: 4, content: '웨이팅이 좀 있지만 그만한 가치가 있어요.', date: '2026-03-15', helpful: 18 },

  // b4 태극당
  { id: 'r10', bakeryId: 'b4', userName: '역사탐방', rating: 5, content: '야채사라다빵 먹으면 옛날 생각나요. 변치 않는 맛!', date: '2026-03-26', helpful: 55 },
  { id: 'r11', bakeryId: 'b4', userName: '노포마니아', rating: 5, content: '모나카 아이스크림 여름에 필수입니다. 겨울엔 단팥빵!', date: '2026-03-22', helpful: 40 },
  { id: 'r12', bakeryId: 'b4', userName: '떡순이', rating: 4, content: '오래된 빵집 특유의 분위기가 좋아요.', date: '2026-03-18', helpful: 22 },

  // b5 성심당 서울팝업
  { id: 'r13', bakeryId: 'b5', userName: '대전사람', rating: 5, content: '서울에서 성심당을 만나다니! 튀김소보로 그 맛 그대로에요.', date: '2026-03-28', helpful: 89 },
  { id: 'r14', bakeryId: 'b5', userName: '부추빵러버', rating: 5, content: '부추빵 웨이팅 1시간 했지만 후회 없어요.', date: '2026-03-27', helpful: 67 },
  { id: 'r15', bakeryId: 'b5', userName: '팝업투어', rating: 5, content: '판타롱부추빵이 진짜 맛있어요! 꼭 드세요.', date: '2026-03-25', helpful: 53 },
  { id: 'r16', bakeryId: 'b5', userName: '맛있는인생', rating: 4, content: '줄이 너무 길어요... 하지만 빵은 완벽.', date: '2026-03-20', helpful: 35 },

  // b6 파리바게뜨 신촌점
  { id: 'r17', bakeryId: 'b6', userName: '연세대생', rating: 4, content: '늦은 밤에도 열려있어서 좋아요!', date: '2026-03-23', helpful: 5 },
  { id: 'r18', bakeryId: 'b6', userName: '야식러', rating: 4, content: '소시지빵이 출출할 때 딱이에요.', date: '2026-03-19', helpful: 3 },

  // b7 나폴레옹과자점
  { id: 'r19', bakeryId: 'b7', userName: '을지로감성', rating: 5, content: '나폴레옹파이 한입 먹으면 바삭한 식감에 행복해져요.', date: '2026-03-25', helpful: 30 },
  { id: 'r20', bakeryId: 'b7', userName: '레트로빵집', rating: 4, content: '마들렌도 맛있고 가게 분위기도 좋아요.', date: '2026-03-20', helpful: 18 },

  // b8 오월의종
  { id: 'r21', bakeryId: 'b8', userName: '방배동주민', rating: 5, content: '고르곤졸라 피자빵 이건 예술이에요!', date: '2026-03-27', helpful: 25 },
  { id: 'r22', bakeryId: 'b8', userName: '빵순이2', rating: 5, content: '사워도우 정말 정성이 느껴져요. 천연발효의 맛.', date: '2026-03-22', helpful: 20 },
  { id: 'r23', bakeryId: 'b8', userName: '건강빵', rating: 4, content: '천연발효빵이라 건강하게 먹을 수 있어요.', date: '2026-03-18', helpful: 12 },

  // b9 CU 베이커리
  { id: 'r24', bakeryId: 'b9', userName: '편의점매니아', rating: 3, content: '가성비 좋아요. 편의점인데 갓구운빵이라니.', date: '2026-03-24', helpful: 8 },
  { id: 'r25', bakeryId: 'b9', userName: '잠실주민', rating: 4, content: '허니버터빵이 은근 맛있어요!', date: '2026-03-20', helpful: 5 },

  // b10 장블랑제리
  { id: 'r26', bakeryId: 'b10', userName: '프랑스유학파', rating: 5, content: '파리에서 먹던 바게트 맛이에요. 한국에서 이 퀄리티라니!', date: '2026-03-26', helpful: 35 },
  { id: 'r27', bakeryId: 'b10', userName: '도산공원', rating: 4, content: '크로와상도 좋지만 캉파뉴가 진짜 맛있어요.', date: '2026-03-22', helpful: 22 },

  // b11 뚜레쥬르 잠실롯데점
  { id: 'r28', bakeryId: 'b11', userName: '롯데월드', rating: 4, content: '놀이공원 다녀와서 쉬기 좋은 카페형 매장이에요.', date: '2026-03-25', helpful: 7 },
  { id: 'r29', bakeryId: 'b11', userName: '브리오슈팬', rating: 4, content: '브리오슈 방금 나온 것 받았는데 최고였어요!', date: '2026-03-21', helpful: 9 },

  // b12 런던베이글뮤지엄
  { id: 'r30', bakeryId: 'b12', userName: '베이글중독', rating: 5, content: '한국 베이글의 혁명! 크림치즈 조합이 환상적이에요.', date: '2026-03-28', helpful: 120 },
  { id: 'r31', bakeryId: 'b12', userName: '웨이팅고수', rating: 4, content: '오픈런 해야 하지만 시나몬베이글은 꼭 먹어보세요.', date: '2026-03-26', helpful: 88 },
  { id: 'r32', bakeryId: 'b12', userName: '인스타그래머', rating: 5, content: '사진 찍기에도 너무 예쁜 공간이에요.', date: '2026-03-23', helpful: 65 },

  // b13 소월길브레드
  { id: 'r33', bakeryId: 'b13', userName: '남산산책', rating: 4, content: '탕종식빵이 촉촉하고 부드러워요. 동네 주민만 아는 맛집.', date: '2026-03-25', helpful: 14 },
  { id: 'r34', bakeryId: 'b13', userName: '스콘매니아', rating: 5, content: '얼그레이 스콘 겉바속촉! 최고의 스콘이에요.', date: '2026-03-21', helpful: 11 },

  // b14 파리바게뜨 여의도점
  { id: 'r35', bakeryId: 'b14', userName: '여의도직장인', rating: 4, content: '점심시간에 빠르게 사먹기 좋아요.', date: '2026-03-24', helpful: 4 },
  { id: 'r36', bakeryId: 'b14', userName: '단팥러버', rating: 4, content: '단팥빵이 든든하고 맛있어요.', date: '2026-03-19', helpful: 3 },

  // b15 앙트레
  { id: 'r37', bakeryId: 'b15', userName: '깐넬레매니아', rating: 5, content: '깐넬레 겉은 캐러멜처럼 바삭, 속은 촉촉. 완벽해요!', date: '2026-03-27', helpful: 38 },
  { id: 'r38', bakeryId: 'b15', userName: '홍대주민', rating: 5, content: '에클레어도 정말 맛있어요. 숨은 맛집!', date: '2026-03-23', helpful: 25 },
  { id: 'r39', bakeryId: 'b15', userName: '디저트투어', rating: 4, content: '프렌치 디저트를 좋아하면 꼭 가보세요.', date: '2026-03-18', helpful: 16 },
];
