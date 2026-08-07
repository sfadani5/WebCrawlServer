# 변경 이력: 네비게이션 & 브레드크럼 체계 일치화

## 문서 메타
- **Rule ID**: N/A
- **변경 분류**: UI/UX 개선 (UI/UX Improvement)
- **변경 일시**: 2026-08-03
- **작성자**: Mistral Vibe
- **상태**: 완료
- **관련 요청**: docs/ask.md PART 1-1

---

## 배경

**문제점**:
- 브레드크럼(`BreadcrumbBar.tsx`)의 명칭(`WebCrawlServer › 관리자 대시보드 › 수집 로그 확인`)과 
- 사이드바 메뉴명(`실시간 수집 로그`), 
- 그리고 실제 탭 상태(`logs`) 간의 이름이 **1:1로 매칭되지 않아** 사용자 혼선 발생

**목표**:
- 사이드바 메뉴명, 브레드크럼 경로, 탭 상태(`ActiveTab`) 명칭을 **1:1 완전 동기화**
- 브레드크럼 구조를 `WebCrawlServer › [카테고리명] › [현재 메뉴명]` 체계로 **규격화**

---

## 메뉴 카테고리 재구성

| 탭 상태 | 메뉴명 | 카테고리 | 브레드크럼 경로 |
|----------|--------|----------|------------------|
| `clients` | 수집 노드 관리 | 관리자 대시보드 | WebCrawlServer › 관리자 대시보드 › 수집 노드 관리 |
| `workers` | 워커 & DB 매니저 | 관리자 대시보드 | WebCrawlServer › 관리자 대시보드 › 워커 & DB 매니저 |
| `console` | 원격 제어 콘솔 | 관리자 대시보드 | WebCrawlServer › 관리자 대시보드 › 원격 제어 콘솔 |
| `network` | 네트워크 모니터링 | 시스템 진단 | WebCrawlServer › 시스템 진단 › 네트워크 모니터링 |
| `logs` | 실시간 수집 로그 | 데이터 관리 | WebCrawlServer › 데이터 관리 › 실시간 수집 로그 |
| `favicon` | 파비콘 생성기 | 유틸리티 | WebCrawlServer › 유틸리티 › 파비콘 생성기 |

---

## 변경 내역

### 1. 사이드바 메뉴 동기화

**파일**: `admin/src/components/layout/Sidebar/Sidebar.tsx`

**변경 내용**:
- 메뉴 순서 재배열: `clients` → `workers` → `console` → `network` → `logs` → `favicon`
- **네트워크 모니터링** 메뉴 신규 추가 (`cell_tower` 아이콘)
- **파비콘 생성기** 메뉴 추가 (`palette` 아이콘)
- 메뉴명표기 일치화: `수집 로그` → `실시간 수집 로그`

**변경 라인**: 40-112

### 2. 브레드크럼 라벨 동기화

**파일**: `admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx`

**변경 내용**:
- `getTabLabel()` 함수 제거 및 `getBreadcrumbParts()` 함수로 대체
- 카테고리별로 구분된 브레드크럼 경로 구조 적용
- 각 탭에 대한 카테고리 및 메뉴명 1:1 매핑

**변경 라인**: 9-44

---

## 검증 체크리스트

- [x] 사이드바 메뉴 클릭 시 브레드크럼의 라벨이 사이드바 메뉴명과 1:1로 일치하는가?
- [x] 모든 메뉴가 올바른 카테고리에 속해 있는가?
- [x] 새로운 네트워크 모니터링 메뉴가 정상적으로 표시되는가?
- [x] 파비콘 생성기 메뉴가 정상적으로 표시되는가?

---

## 영향 범위

- **사용자 경험**: 네비게이션 일관성이 대폭 향상되어 사용자가 현재 위치를 쉽게 인식 가능
- **UI/UX 일관성**: 모든 메뉴가 동일한 네이밍 규약을 따르게 됨
- **유지보수성**: 미래에 새로운 메뉴 추가 시 동일한 패턴을 따를 수 있음

---

## 관련 문서

- [docs/ask.md](../../ask.md) - 원래 요청 문서
- [R-00302 admin-ui-ux-guidelines.md](../../rule/R-00302 admin-ui-ux-guidelines.md) - UI/UX 가이드라인
- [R-00301 admin-development-guidelines.md](../../rule/R-00301 admin-development-guidelines.md) - admin 개발 가이드

---

## 후속 작업

- [ ] 각 메뉴별로 세부 기능 검증
- [ ] 사용자 피드백 수집 및 추가 개선 사항 확인