import { describe, it, expect } from "vitest";
import { matchVenue, fmtDate, fmtTime, clean, transformRow } from "../scripts/normalize.mjs";

describe("fmtDate", () => {
  it("YYYYMMDD를 YYYY-MM-DD로 변환한다", () => {
    expect(fmtDate("20250523")).toBe("2025-05-23");
  });
  it("형식이 아니면 null", () => {
    expect(fmtDate("2025-05")).toBeNull();
    expect(fmtDate(null)).toBeNull();
    expect(fmtDate("")).toBeNull();
  });
});

describe("fmtTime", () => {
  it("HHmm을 HH:mm으로 변환한다", () => {
    expect(fmtTime("1900")).toBe("19:00");
  });
  it("형식이 아니면 null", () => {
    expect(fmtTime("19시")).toBeNull();
    expect(fmtTime(null)).toBeNull();
  });
});

describe("clean", () => {
  it("CRLF를 LF로 바꾸고 앞뒤 공백 제거", () => {
    expect(clean("내용\r\n\r\n")).toBe("내용");
  });
  it("빈 값은 null", () => {
    expect(clean("  ")).toBeNull();
    expect(clean(null)).toBeNull();
  });
});

describe("matchVenue — SPEC §2.3 장소 정규화", () => {
  it.each([
    ["서울도서관 4층 사서교육장", "saseo"],
    ["사서교육장", "saseo"],
    ["도서관4층 사서교육장", "saseo"],
    ["서ㅏ서교육장, 문래동 예술촌", "saseo"], // 원본 오타
    ["서울도서관 1층 기획전시실", "gihoek"],
    ["서울도서관 4층 기획전시실", "gihoek"], // 층 오기재도 공간 우선
    ["일반자료실 생각마루", "maru"],
    ["서울도서관2층 생각마루 전시공간", "maru"],
    ["일반자료실1", "ilban1"],
    ["일반자료실 1 왼쪽 벽면서가", "ilban1"],
    ["서울도서관 일반자료실2 전시서가 (2층)", "ilban2"],
    ["서울도서관 4층 세계자료실", "segye"],
    ["서울도서관 3층 서울자료실", "seoul-room"],
    ["서울도서관 2층 디지털자료실", "digital"],
    ["장애인자료실", "jangae"],
  ])("%s → %s", (place, venueId) => {
    expect(matchVenue(place)).toBe(venueId);
  });

  it.each([
    ["일반자료실1,2", "jaryosil"],
    ["서울도서관 6개 자료실", "jaryosil"],
    ["각 자료실 전시서가", "jaryosil"],
    ["일반자료실2, 디지털자료실", "jaryosil"], // 복수 공간
    ["서울도서관 자료실", "jaryosil"],
  ])("복수/일반 자료실 표기 %s → %s", (place, venueId) => {
    expect(matchVenue(place)).toBe(venueId);
  });

  it.each([
    ["서울광장", "plaza"],
    ["책읽는 서울광장", "plaza"],
    ["광화문 책마당 실내라운지", "gwanghwamun"],
    ["광화문역 3번 출구 교보문고방면 지하1층 대합실", "gwanghwamun"],
    ["청계천 오간수교 아래", "malgeun"],
  ])("외부 지점 %s → %s", (place, venueId) => {
    expect(matchVenue(place)).toBe(venueId);
  });

  it("도서관 외부 공간/미상 표기", () => {
    expect(matchVenue("서울도서관 (정문 앞)")).toBe("lib-outdoor");
    expect(matchVenue("서울도서관")).toBe("lib-etc");
    expect(matchVenue("3, 4층")).toBe("lib-etc");
  });

  it("미기재는 etc, 매칭 불가 외부 장소는 null(리포트 대상)", () => {
    expect(matchVenue(null)).toBe("etc");
    expect(matchVenue("코엑스홀 A")).toBeNull();
    expect(matchVenue("02-2133-0267")).toBeNull();
  });
});

describe("transformRow", () => {
  const base = {
    schdul_id: "8508",
    schdul_title: "방구석 북토크(남궁인)",
    schdul_cntent: "[서울 문화의 밤] 5월 방구석 북토크\r\n\r\n",
    schdul_ty: "0003",
    date_from: "20250523",
    date_to: "20250523",
    time_from: "1900",
    time_to: "2030",
    period: "0001",
    period_value: null,
    place: "일반자료실 생각마루",
    spnser: "서울도서관 ",
    refer_url: "https://lib.seoul.go.kr/lecture/applyDetail/5982",
    city: null,
    schdul_nm: "강연일",
  };

  it("정상 행을 이벤트로 변환한다", () => {
    const { event, error, unmatchedPlace } = transformRow(base);
    expect(error).toBeNull();
    expect(unmatchedPlace).toBeNull();
    expect(event).toMatchObject({
      id: "8508",
      kind: "강연",
      category: "event",
      dateFrom: "2025-05-23",
      dateTo: "2025-05-23",
      timeFrom: "19:00",
      timeTo: "20:30",
      period: "day",
      venueId: "maru",
      organizer: "서울도서관",
      year: 2025,
      isMultiDay: false,
    });
    expect(event.content).not.toContain("\r");
  });

  it("시간 0000-0000은 시간 미지정으로 null 처리 (SPEC §2.1)", () => {
    const { event } = transformRow({ ...base, time_from: "0000", time_to: "0000" });
    expect(event.timeFrom).toBeNull();
    expect(event.timeTo).toBeNull();
  });

  it("기간 행사는 isMultiDay=true", () => {
    const { event } = transformRow({ ...base, schdul_ty: "0004", date_to: "20250531" });
    expect(event.kind).toBe("전시");
    expect(event.isMultiDay).toBe(true);
  });

  it("야외공간 운영 코드는 장소 표기와 무관하게 코드가 venue를 결정한다 (SPEC §2.2)", () => {
    const { event } = transformRow({ ...base, schdul_ty: "0014", place: null });
    expect(event.category).toBe("outdoor");
    expect(event.venueId).toBe("plaza");
    const closed = transformRow({ ...base, schdul_ty: "0015", place: null }).event;
    expect(closed.category).toBe("outdoor-closed");
  });

  it("주 반복 일정은 period=week + 요일 유지 (F6 대비)", () => {
    const { event } = transformRow({
      ...base,
      period: "0002",
      period_value: "금요일",
      date_from: "20241122",
      date_to: "20241129",
    });
    expect(event.period).toBe("week");
    expect(event.periodValue).toBe("금요일");
  });

  it("알 수 없는 타입 코드는 error를 반환한다", () => {
    const { event, error } = transformRow({ ...base, schdul_ty: "9999" });
    expect(event).toBeNull();
    expect(error).toContain("9999");
  });

  it("미매칭 장소는 etc + unmatchedPlace 리포트", () => {
    const { event, unmatchedPlace } = transformRow({ ...base, place: "코엑스홀 A" });
    expect(event.venueId).toBe("etc");
    expect(unmatchedPlace).toBe("코엑스홀 A");
  });
});
