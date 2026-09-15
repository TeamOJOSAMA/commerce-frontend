// public/products/<카테고리 폴더>/ 밑에 받아 둔 상품 이미지 파일명 목록이다.
// 백엔드는 상품에 이미지 URL을 내려주지 않으므로, 상품명으로 로컬 이미지를 찾아 연결한다.
// 폴더명에 ':'가 있으면 Vite 정적 서버가 경로를 못 찾아(SPA 폴백으로 빠짐) '_'로 바꿔 받았다.
const CATEGORY_FOLDERS = {
  CLOTHING: '패션의류',
  ELECTRONICS: '가전_디지털',
  SPORTS: '스포츠_레저',
  FOOD: '식품',
  OTHER: '기타',
};

const IMAGE_FILES = {
  CLOTHING: [
    '니트 가디건.jpg', '니트 베스트.jpg', '데님 팬츠.jpg', '레더 자켓.jpg', '롱 원피스.jpg',
    '무스탕 자켓.jpg', '미니 스커트.jpg', '반팔 티셔츠.jpg', '블레이저 자켓.jpg', '숏패딩.jpg',
    '스트라이프 셔츠.jpg', '와이드 슬랙스.jpg', '조거 팬츠.jpg', '체크 셔츠.jpg', '카고 팬츠.jpg',
    '크루넥 니트.jpg', '트레이닝 세트.jpg', '트렌치 코트.jpg', '플리스 자켓.jpg', '후드 집업.jpg',
  ],
  ELECTRONICS: [
    '27인치 모니터.jpg', 'USB-C.jpg', '가습기.jpg', '게이밍 헤드셋.jpg', '고속 충전기.jpg',
    '공기청정기.jpg', '기계식 키보드.jpg', '노트북 거치대.jpg', '로봇청소기.jpg', '무선 마우스.jpg',
    '무선 이어폰.jpg', '무선청소기.jpg', '미니 프로젝터.jpg', '보조배터리.jpg', '블루투스 스피커.jpg',
    '스마트워치.jpg', '에어프라이어.jpg', '웹캠.jpg', '전기포트.jpg', '제습기.jpg',
  ],
  SPORTS: [
    '골프 장갑.jpg', '농구공.jpg', '덤벨 세트.jpg', '돔 텐트.jpg', '등산 배날.jpg',
    '러닝화.jpg', '배드민턴 라켓.jpg', '수영복.jpg', '스포츠 워치.jpg', '요가매트.jpg',
    '자전거 헬멧.jpg', '줄넘기.jpg', '짐볼.jpg', '추구공.jpg', '캠핑 매트.jpg',
    '캠핑 체어.jpg', '클라이밍 홀드.jpg', '트레이닝 레깅스.jpg', '폴딩 자전거.jpg', '폼롤러.jpg',
  ],
  FOOD: [
    '견과류 믹스.jpg', '견과류 세트.jpg', '곡물 세트.jpg', '과일.jpg', '그래놀라.jpg',
    '그릭요거트.png', '냉동 만두.jpg', '떡볶이.jpg', '라면.png', '발사믹 식초.jpg',
    '올리브유.jpg', '잼.jpg', '전통 한과.jpg', '조미김.jpg', '참치캔.jpg',
    '파스타 소스.jpg', '파스타면.jpg', '한우.jpg', '현미밥.jpg', '훈제오리.jpg',
  ],
  OTHER: [
    '3단 우산.png', '거치대.png', '멀티탭.png', '미니가습기.png', '미니선풍기.png',
    '반지갑.png', '백팩.png', '보조가방.png', '복베개.png', '손목시계.png',
    '썬그리.png', '장우산.png', '접이식카트.png', '차량용방향제.png', '차량충전기.png',
    '캠핑랜턴.png', '케리어.png', '크로스백.png', '텀블러.png', '휴대용손전등.png',
  ],
};

// 파일명이 실제 상품명의 축약형/오타라 부분일치로 못 잇는 것만 예외로 짚어준다.
// 키는 확장자를 뗀 파일명, 값은 실제 상품명(의 일부. 부분일치 규칙에 다시 태운다)이다.
const NAME_OVERRIDES = {
  '견과류 세트': '견과류 선물세트',
  '곡물 세트': '곡물 선물세트',
  '등산 배날': '등산 배낭',
  '추구공': '축구공',
  '3단 우산': '3단 접이식 우산',
  '복베개': '메모리폼 목베개',
  '썬그리': '편광 선글라스',
  '접이식카트': '접이식 쇼핑카트',
  '차량충전기': '차량용 고속충전기',
  '캠핑랜턴': '캠핑용 랜턴',
  '케리어': '캐리어 20인치',
  '휴대용손전등': '무선 휴대용 조명',
};

const normalize = (name) => name.replace(/\s+/g, '').toLowerCase();

let indexByCategory = null;

function buildIndex() {
  const index = {};
  for (const [category, files] of Object.entries(IMAGE_FILES)) {
    index[category] = files.map((file) => {
      const base = file.replace(/\.(jpg|jpeg|png)$/i, '');
      const productNameHint = NAME_OVERRIDES[base] ?? base;
      return { file, normalized: normalize(productNameHint) };
    });
  }
  return index;
}

// 상품명이 파일명(또는 그 오타 보정본)을 부분 문자열로 포함하면 그 이미지를 쓴다.
// 예: 파일 "고속 충전기" -> 상품 "고속충전기 65W"에 포함되므로 매칭.
export function getProductImageUrl(product) {
  if (!product?.name || !product?.category) return null;

  const folder = CATEGORY_FOLDERS[product.category];
  if (!folder) return null;

  indexByCategory ??= buildIndex();
  const candidates = indexByCategory[product.category] ?? [];
  const normalizedProductName = normalize(product.name);

  const match = candidates.find((candidate) => normalizedProductName.includes(candidate.normalized));
  if (!match) return null;

  return `/products/${encodeURIComponent(folder)}/${encodeURIComponent(match.file)}`;
}
