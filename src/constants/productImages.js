// public/products/<카테고리 폴더>/ 밑에 받아 둔 상품 이미지 파일명 목록이다.
// 백엔드는 상품에 이미지 URL을 내려주지 않으므로, 상품명으로 로컬 이미지를 찾아 연결한다.
// 폴더명에 ':'가 있으면 Vite 정적 서버가 경로를 못 찾아(SPA 폴백으로 빠짐) '_'로 바꿔 받았다.
const CATEGORY_FOLDERS = {
  CLOTHING: '패션의류',
  ELECTRONICS: '가전_디지털',
  SPORTS: '스포츠_레저',
  FURNITURE: '가구',
  BEVERAGE: '음료',
  BEAUTY: '뷰티',
  FOOD: '식품',
  PET: '반려동물',
  OFFICE_SUPPLIES: '문구_오피스',
  BOOKS: '도서',
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
  FURNITURE: [
    '3단서랍장.jpg', '3인용 패브릭 소파.jpg', '4인용식탁세트.jpg', '5단 책장.jpg', 'LED화장대.jpg',
    '극세사 러그.jpg', '데스크매트.jpg', '메모리폼 매트리스.jpg', '붙박이형 옷장.jpg', '빈백소파.jpg',
    '사무용의자.jpg', '수납장.jpg', '스탠드 조명.jpg', '암막커튼.jpg', '원목책상.jpg',
    '원목협탁.jpg', '전신거울.jpg', '침대 프레임.jpg', '파티션.jpg', '행거.jpg',
  ],
  BEVERAGE: [
    '과일청베이스.jpg', '녹차티백.jpg', '두유세트.jpg', '드립백 커피 30입.jpg', '라떼베이스.jpg',
    '보리차티백.jpg', '비타민워터.jpg', '스포츠음료세트.jpg', '아이스티.jpg', '유기농원두 1kg.jpg',
    '이온음료.jpg', '인스턴트커피.jpg', '제로콜라.jpg', '캡슐커피세트.jpg', '코코넛워터.jpg',
    '콜드브루 원액.jpg', '탄산수.jpg', '프로틴쉐이크.jpg', '핫초코믹스.jpg', '홍차티백세트.jpg',
  ],
  BEAUTY: [
    '롱래스팅 마스카라.jpg', '마스크팩 10매.jpg', '매트립스틱.jpg', '무기자차선크림.jpg', '미니향수.jpg',
    '바디로션.jpg', '수분크림.jpg', '스킨부스터앰플.jpg', '아이쉐도우.jpg', '약산성토너.jpg',
    '자외선차단스틱.jpg', '젤 아이라이너.jpg', '촉촉립밤.jpg', '쿠션파운데이션.jpg', '클렌징오일.jpg',
    '클렌징폼.jpg', '필링패드.jpg', '핸드크림세트.jpg', '헤어에센스.jpg', '히알루론산에센스.jpg',
  ],
  OTHER: [
    '3단 우산.png', '거치대.png', '멀티탭.png', '미니가습기.png', '미니선풍기.png',
    '반지갑.png', '백팩.png', '보조가방.png', '복베개.png', '손목시계.png',
    '썬그리.png', '장우산.png', '접이식카트.png', '차량용방향제.png', '차량충전기.png',
    '캠핑랜턴.png', '케리어.png', '크로스백.png', '텀블러.png', '휴대용손전등.png',
  ],
  PET: [
    '강아지 겨울옷.jpg', '강아지 목줄.jpg', '강아지 사료.jpg', '강아지 수제간식.jpg', '강아지 장난감 세트.jpg',
    '강아지 하네스.jpg', '고양이 낚싯대 장난감.jpg', '고양이 모래.jpg', '고양이 사료.jpg', '고양이 스크래처.jpg',
    '고양이 자동 화장실.jpg', '고양이 트릿.jpg', '반려동물 이동장.jpg', '배변패드.jpg', '슬리커 브러시.jpg',
    '캣타워.avif', '펫 방석.jpg', '펫 자동급식기.jpg', '펫 저자극 샴푸.jpg', '펫 카스트.jpg',
  ],
  OFFICE_SUPPLIES: [
    '3공파일 바인더.jpg', 'A4 복사용지.jpg', '네임펜.jpg', '데스크 정리함.jpg', '마스킹테이프.jpg',
    '만년필.jpg', '무지노트.jpg', '북마크 세트.jpg', '샤프심.jpg', '수정테이프.jpg',
    '스테이플러.jpg', '연필 12자루.jpg', '위클리 다이어리.jpg', '자석 화이트보드.jpg', '젤펜 10자루.jpg',
    '지우개 세트.jpg', '클리어파일.jpg', '탁상용 캘린더.jpg', '포스트잇 세트.jpg', '형광펜 세트.jpg',
  ],
  BOOKS: [
    'IT 개발 입문서.jpg', '경제경영.jpg', '과학 교양서.jpg', '그래픽노블.jpg', '다이어리 플래너북.jpg',
    '만화책.jpg', '수험서.jpg', '시집.jpg', '심리학 입문서.jpg', '에세이.jpg',
    '여행 에세이.jpg', '역사 교양서.jpg', '영어회화 교재.jpg', '요리 레시피북.jpg', '이린이 그림책.jpg',
    '인문학 교양서.jpg', '자기계발.jpg', '자서전.jpg', '재테크 가이드북.jpg', '화제의 소설.jpg',
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
  '아이쉐도우': '아이섀도 팔레트',
  '과일청베이스': '과일청 에이드베이스',
  '형광펜 세트': '형광펜 6color 세트',
  '이린이 그림책': '어린이 그림책 세트',
  '펫 카스트': '차량용 펫 카시트',
};

const normalize = (name) => name.replace(/\s+/g, '').toLowerCase();

let indexByCategory = null;

function buildIndex() {
  const index = {};
  for (const [category, files] of Object.entries(IMAGE_FILES)) {
    index[category] = files.map((file) => {
      const base = file.replace(/\.(jpg|jpeg|png|avif|webp)$/i, '');
      const productNameHint = NAME_OVERRIDES[base] ?? base;
      return { file, normalized: normalize(productNameHint) };
    });
  }
  return index;
}

// 상품명이 파일명(또는 그 오타 보정본)을 부분 문자열로 포함하면 그 이미지를 쓴다.
// 예: 파일 "고속 충전기" -> 상품 "고속충전기 65W"에 포함되므로 매칭.
// 후보가 여럿 걸리면(예: "에세이"와 "여행 에세이"가 둘 다 상품 "여행 에세이"에 포함) 더
// 구체적인(긴) 이름을 우선한다.
function findImageInCategory(category, productName) {
  const folder = CATEGORY_FOLDERS[category];
  if (!folder) return null;

  indexByCategory ??= buildIndex();
  const candidates = indexByCategory[category] ?? [];
  const normalizedProductName = normalize(productName);

  const matches = candidates.filter((candidate) => normalizedProductName.includes(candidate.normalized));
  if (matches.length === 0) return null;

  const best = matches.reduce((a, b) => (b.normalized.length > a.normalized.length ? b : a));
  return `/products/${encodeURIComponent(folder)}/${encodeURIComponent(best.file)}`;
}

// 카테고리를 알면(상품 목록/상세) 그 카테고리에서만 찾고, 모르면(장바구니·주문 항목처럼
// 상품명만 있는 곳) 이미지가 있는 카테고리를 전부 뒤져서 찾는다.
export function getProductImageUrl(product) {
  if (!product?.name) return null;

  if (product.category) {
    return findImageInCategory(product.category, product.name);
  }

  for (const category of Object.keys(CATEGORY_FOLDERS)) {
    const url = findImageInCategory(category, product.name);
    if (url) return url;
  }
  return null;
}
