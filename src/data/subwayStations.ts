export interface SubwayStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: { line: string; color: string }[];
}

// 공식 색상보다 채도 낮춤 — CartoDB 타일 색감에 맞춤
const L1 = { line: '1', color: '#4A7DB5' };
const L2 = { line: '2', color: '#3FA66B' };
const L3 = { line: '3', color: '#D4874A' };
const L4 = { line: '4', color: '#38AACC' };
const L5 = { line: '5', color: '#8B6DAE' };
const L6 = { line: '6', color: '#C07840' };
const L7 = { line: '7', color: '#7A8C3A' };
const L8 = { line: '8', color: '#C45A82' };
const L9 = { line: '9', color: '#B8AA3A' };
const SBD = { line: '신분당', color: '#C43060' };
const BD  = { line: '분당', color: '#D4961E' };

export const SUBWAY_STATIONS: SubwayStation[] = [
  // ── 1호선 ──
  { id: 's_seoul',     name: '서울역',         lat: 37.5547, lng: 126.9707, lines: [L1, L4] },
  { id: 's_city',      name: '시청',           lat: 37.5649, lng: 126.9764, lines: [L1, L2] },
  { id: 's_jongak',    name: '종각',           lat: 37.5700, lng: 126.9826, lines: [L1] },
  { id: 's_jongno3',   name: '종로3가',        lat: 37.5714, lng: 126.9917, lines: [L1, L3, L5] },
  { id: 's_jongno5',   name: '종로5가',        lat: 37.5718, lng: 127.0022, lines: [L1] },
  { id: 's_dongdaemun',name: '동대문',         lat: 37.5714, lng: 127.0096, lines: [L1, L4] },
  { id: 's_ddmh',      name: '동대문역사문화공원',lat:37.5659, lng: 127.0090, lines: [L2, L4, L5] },
  { id: 's_shindorim', name: '신도림',         lat: 37.5087, lng: 126.8913, lines: [L1, L2] },
  { id: 's_guro',      name: '구로',           lat: 37.4987, lng: 126.8963, lines: [L1] },
  { id: 's_yeongdeungpo', name: '영등포',      lat: 37.5157, lng: 126.9069, lines: [L1] },
  { id: 's_suwon',     name: '수원역',         lat: 37.2666, lng: 127.0001, lines: [L1] },
  { id: 's_incheon',   name: '인천역',         lat: 37.4754, lng: 126.6164, lines: [L1] },
  { id: 's_bupyeong',  name: '부평역',         lat: 37.4895, lng: 126.7228, lines: [L1] },
  { id: 's_juan',      name: '주안역',         lat: 37.4710, lng: 126.7048, lines: [L1] },
  { id: 's_dongam',    name: '동암역',         lat: 37.4861, lng: 126.7268, lines: [L1] },
  { id: 's_baegun',    name: '백운역',         lat: 37.4665, lng: 126.7050, lines: [L1] },

  // ── 2호선 ──
  { id: 's_gangnam',   name: '강남',           lat: 37.4979, lng: 127.0276, lines: [L2] },
  { id: 's_yeoksam',   name: '역삼',           lat: 37.5006, lng: 127.0363, lines: [L2] },
  { id: 's_seolleung', name: '선릉',           lat: 37.5045, lng: 127.0490, lines: [L2, BD] },
  { id: 's_samsung',   name: '삼성',           lat: 37.5088, lng: 127.0633, lines: [L2] },
  { id: 's_jamsil',    name: '잠실',           lat: 37.5133, lng: 127.1002, lines: [L2, L8] },
  { id: 's_konkuk',    name: '건대입구',       lat: 37.5403, lng: 127.0699, lines: [L2, L7] },
  { id: 's_seongsu',   name: '성수',           lat: 37.5445, lng: 127.0558, lines: [L2] },
  { id: 's_wangsimni', name: '왕십리',         lat: 37.5613, lng: 127.0388, lines: [L2, L5] },
  { id: 's_euljiro3',  name: '을지로3가',      lat: 37.5662, lng: 126.9911, lines: [L2, L3] },
  { id: 's_euljiro4',  name: '을지로4가',      lat: 37.5676, lng: 126.9980, lines: [L2, L5] },
  { id: 's_hongdae',   name: '홍대입구',       lat: 37.5573, lng: 126.9244, lines: [L2] },
  { id: 's_hapjeong',  name: '합정',           lat: 37.5497, lng: 126.9149, lines: [L2, L6] },
  { id: 's_dangsan',   name: '당산',           lat: 37.5349, lng: 126.9014, lines: [L2, L9] },
  { id: 's_ydgucheong', name: '영등포구청',    lat: 37.5258, lng: 126.8960, lines: [L2, L5] },
  { id: 's_sindaebang', name: '신대방',        lat: 37.4877, lng: 126.9118, lines: [L2] },
  { id: 's_sinlim',    name: '신림',           lat: 37.4843, lng: 126.9295, lines: [L2] },
  { id: 's_nakseongdae', name: '낙성대',       lat: 37.4772, lng: 126.9640, lines: [L2] },
  { id: 's_sadang',    name: '사당',           lat: 37.4763, lng: 126.9816, lines: [L2, L4] },
  { id: 's_bangbae',   name: '방배',           lat: 37.4811, lng: 126.9976, lines: [L2] },
  { id: 's_seocho',    name: '서초',           lat: 37.4836, lng: 127.0124, lines: [L2] },
  { id: 's_gyodae',    name: '교대',           lat: 37.4936, lng: 127.0143, lines: [L2, L3] },
  { id: 's_sindaemyeong', name: '신촌',        lat: 37.5551, lng: 126.9368, lines: [L2] },
  { id: 's_ewha',      name: '이대',           lat: 37.5577, lng: 126.9459, lines: [L2] },
  { id: 's_ahy',       name: '아현',           lat: 37.5537, lng: 126.9570, lines: [L2] },
  { id: 's_chungjeong', name: '충정로',        lat: 37.5557, lng: 126.9637, lines: [L2, L5] },
  { id: 's_sindorim2', name: '신도림',         lat: 37.5087, lng: 126.8913, lines: [L2, L1] },
  { id: 's_mullae',    name: '문래',           lat: 37.5185, lng: 126.8967, lines: [L2] },
  { id: 's_daerim',    name: '대림',           lat: 37.4922, lng: 126.8959, lines: [L2, L7] },
  { id: 's_gurodigital', name: '구로디지털단지', lat: 37.4850, lng: 126.9014, lines: [L2] },

  // ── 3호선 ──
  { id: 's_gokhter',   name: '고속터미널',     lat: 37.5051, lng: 127.0047, lines: [L3, L7, L9] },
  { id: 's_sinsa',     name: '신사',           lat: 37.5200, lng: 127.0199, lines: [L3] },
  { id: 's_apgujeong', name: '압구정',         lat: 37.5272, lng: 127.0281, lines: [L3] },
  { id: 's_oksu',      name: '옥수',           lat: 37.5400, lng: 127.0177, lines: [L3] },
  { id: 's_yaksu',     name: '약수',           lat: 37.5560, lng: 127.0146, lines: [L3, L6] },
  { id: 's_chungmuro', name: '충무로',         lat: 37.5618, lng: 126.9987, lines: [L3, L4] },
  { id: 's_anguk',     name: '안국',           lat: 37.5784, lng: 126.9852, lines: [L3] },
  { id: 's_gyeongbok', name: '경복궁',         lat: 37.5770, lng: 126.9769, lines: [L3] },
  { id: 's_dongnimmun', name: '독립문',        lat: 37.5789, lng: 126.9607, lines: [L3] },
  { id: 's_yangje',    name: '양재',           lat: 37.4846, lng: 127.0344, lines: [L3, SBD] },
  { id: 's_maebong',   name: '매봉',           lat: 37.4861, lng: 127.0468, lines: [L3] },
  { id: 's_dogok',     name: '도곡',           lat: 37.4941, lng: 127.0516, lines: [L3, BD] },
  { id: 's_suseo',     name: '수서',           lat: 37.4874, lng: 127.1002, lines: [L3] },

  // ── 4호선 ──
  { id: 's_myeongdong', name: '명동',          lat: 37.5634, lng: 126.9838, lines: [L4] },
  { id: 's_hyehwa',    name: '혜화',           lat: 37.5820, lng: 127.0017, lines: [L4] },
  { id: 's_hansung',   name: '한성대입구',     lat: 37.5877, lng: 127.0096, lines: [L4] },
  { id: 's_dongja',    name: '동작',           lat: 37.5105, lng: 126.9787, lines: [L4, L9] },
  { id: 's_nakst',     name: '남태령',         lat: 37.4683, lng: 126.9823, lines: [L4] },
  { id: 's_miasag',    name: '미아사거리',     lat: 37.6210, lng: 127.0317, lines: [L4] },

  // ── 5호선 ──
  { id: 's_gwanghwamun', name: '광화문',       lat: 37.5713, lng: 126.9769, lines: [L5] },
  { id: 's_seodaemun',  name: '서대문',        lat: 37.5739, lng: 126.9670, lines: [L5] },
  { id: 's_gongdeok',   name: '공덕',          lat: 37.5462, lng: 126.9520, lines: [L5, L6] },
  { id: 's_mapo',       name: '마포',          lat: 37.5395, lng: 126.9513, lines: [L5] },
  { id: 's_yeouido',    name: '여의도',        lat: 37.5217, lng: 126.9243, lines: [L5, L9] },

  // ── 6호선 ──
  { id: 's_itaewon',   name: '이태원',         lat: 37.5345, lng: 126.9946, lines: [L6] },
  { id: 's_hangangjin', name: '한강진',        lat: 37.5363, lng: 127.0054, lines: [L6] },
  { id: 's_noksapyeong', name: '녹사평',       lat: 37.5392, lng: 126.9851, lines: [L6] },
  { id: 's_mapo2',      name: '마포구청',      lat: 37.5559, lng: 126.9086, lines: [L6] },

  // ── 7호선 ──
  { id: 's_issu',      name: '이수',           lat: 37.4875, lng: 126.9817, lines: [L7, L4] },
  { id: 's_banpo',     name: '반포',           lat: 37.5039, lng: 127.0066, lines: [L7] },
  { id: 's_hakdong',   name: '학동',           lat: 37.5131, lng: 127.0306, lines: [L7] },
  { id: 's_gangnamgucheong', name: '강남구청', lat: 37.5152, lng: 127.0440, lines: [L7] },
  { id: 's_cheongdam', name: '청담',           lat: 37.5196, lng: 127.0563, lines: [L7] },
  { id: 's_ttugsomup', name: '뚝섬유원지',     lat: 37.5316, lng: 127.0673, lines: [L7] },

  // ── 8호선 ──
  { id: 's_moran',     name: '모란',           lat: 37.4296, lng: 127.1294, lines: [L8, BD] },
  { id: 's_tancheon',  name: '탄천',           lat: 37.4426, lng: 127.1303, lines: [L8] },
  { id: 's_bokjeong',  name: '복정',           lat: 37.4512, lng: 127.1370, lines: [L8] },

  // ── 9호선 ──
  { id: 's_sinnonhyun', name: '신논현',        lat: 37.5047, lng: 127.0246, lines: [L9] },
  { id: 's_unju',       name: '언주',          lat: 37.5092, lng: 127.0389, lines: [L9] },
  { id: 's_seonjeong',  name: '선정릉',        lat: 37.5091, lng: 127.0481, lines: [L9] },
  { id: 's_samseongj',  name: '삼성중앙',      lat: 37.5082, lng: 127.0584, lines: [L9] },
  { id: 's_bongeunsa',  name: '봉은사',        lat: 37.5151, lng: 127.0637, lines: [L9] },

  // ── 신분당선 ──
  { id: 's_yangjae_sbd', name: '양재시민의숲', lat: 37.4700, lng: 127.0477, lines: [SBD] },
  { id: 's_cheonggyesan', name: '청계산입구',  lat: 37.4587, lng: 127.0590, lines: [SBD] },
  { id: 's_pangyo',      name: '판교',         lat: 37.3948, lng: 127.1111, lines: [SBD] },
  { id: 's_jeongja',     name: '정자',         lat: 37.3637, lng: 127.1128, lines: [SBD, BD] },
  { id: 's_migeum',      name: '미금',         lat: 37.3529, lng: 127.1161, lines: [SBD, BD] },

  // ── 분당선 ──
  { id: 's_suseo_bd',    name: '수서',         lat: 37.4878, lng: 127.1002, lines: [BD] },
  { id: 's_bokjeong_bd', name: '복정',         lat: 37.4512, lng: 127.1370, lines: [BD, L8] },
  { id: 's_sunae',       name: '수내',         lat: 37.3785, lng: 127.1156, lines: [BD] },
  { id: 's_pangyo_bd',   name: '판교',         lat: 37.3944, lng: 127.1075, lines: [BD] },

  // ── 인천 1호선 ──
  { id: 's_bupyeong_incheon', name: '부평구청', lat: 37.5029, lng: 126.7217, lines: [{ line: '인천1', color: '#7CA8D5' }] },
  { id: 's_gansok',      name: '간석오거리',   lat: 37.4820, lng: 126.7170, lines: [{ line: '인천1', color: '#7CA8D5' }] },
  { id: 's_incheon_city_hall', name: '인천시청', lat: 37.4563, lng: 126.7050, lines: [{ line: '인천1', color: '#7CA8D5' }] },
  { id: 's_dongingcheon', name: '동인천',      lat: 37.4734, lng: 126.6367, lines: [L1] },

  // ── 경의중앙선 ──
  { id: 's_gongdeok_gdz', name: '공덕',        lat: 37.5462, lng: 126.9520, lines: [{ line: '경의', color: '#77C4A3' }] },
  { id: 's_susaek',       name: '수색',        lat: 37.5857, lng: 126.8760, lines: [{ line: '경의', color: '#77C4A3' }] },
  { id: 's_neunggok',     name: '능곡',        lat: 37.6366, lng: 126.8328, lines: [{ line: '경의', color: '#77C4A3' }] },
];
