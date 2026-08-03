# 현재 작업 (docs/todo.md)

> 본 문서는 AI가 진행 중인 작업의 계획과 상태를 관리하는 문서입니다.

## 진행 중인 작업

- [ ] 추가 작업 없음

## 완료된 작업

- [x] **2026-08-03** - 관리자 대시보드에 Utils 메뉴 및 파비콘 만들기 기능 추가
  - 사이드바에 계단식 메뉴 구조 구현 (Utils > 파비콘 만들기)
  - 드래그 앤 드랍 기반 파비콘 생성 유틸리티 개발
  - 6가지 크기(16, 32, 48, 180, 192, 512)의 파비콘 자동 생성
  - JSZip을 사용한 ZIP 압축 다운로드 기능 구현
  - TypeScript 타입 안전성 및 ESM 표준 준수
  - 관련 파일: `admin/src/types/index.ts`, `admin/src/App.tsx`, `admin/src/components/layout/Sidebar/Sidebar.tsx`, `admin/src/components/views/FaviconGeneratorView.tsx`
  - 이력: `docs/askLogs/ask-20260803103000.md`

- [x] **2026-08-04** - 관리자 페이지 파비콘 및 매니페스트 바인딩
  - `admin/index.html`에 전체 규격 파비콘 태그 선언
  - `admin/public/site.webmanifest` 업데이트
  - 모든 브라우저 및 기기 호환성 보장
  - PWA 지원 (standalone 모드, 테마 색상 등)
  - 관련 파일: `admin/index.html`, `admin/public/site.webmanifest`
  - 이력: `docs/askLogs/ask-20260804013000.md`

## 다음 작업

- waiting for new request

