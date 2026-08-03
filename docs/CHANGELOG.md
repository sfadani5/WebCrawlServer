# 변경 이력 (docs/CHANGELOG.md)

> 본 문서는 프로젝트의 버전별 변경 내역을 기록하는 메인 인덱스 파일입니다.
> AGENTS.md 2장에서 예외로 언급된 파일로, 컨텍스트 로딩 시 참조 대상이 됩니다.
> 상세 변경 이력은 `docs/CHANGELOG/` 폴더에 연도/버전별로 분리 저장합니다.

---


---
## 버전 형식

- **메이저 버전 (X.0.0)**: 호환성Break가 있는 주요 변경
- **마이너 버전 (0.Y.0)**: 하위 호환성을 유지한 새로운 기능 추가
- **패치 버전 (0.0.Z)**: 버그 수정 및 사소한 개선

---
## CHANGELOG 관리 규칙

1. 모든 커밋은 해당 버전 섹션에 기록
2. 변경 사항은 사실적 기술 (마케팅 용어 사용 금지)
3. 상세 내용은 `docs/CHANGELOG/` 폴더의 하위 문서에 기록
4. 릴리스 시 새로운 버전 섹션 생성 및 Unreleased 내용 이관

---

## 관련 폴더

- `docs/CHANGELOG/` - 상세 변경 이력 저장소
- `docs/askLogs/` - 작업 요청/처리 이력
- `docs/decision/` - 설계 결정 기록 (ADR)

---
## Unreleased

- `docs/CHANGELOG/fix-eslint-no-explicit-any-20260803061300.md`: ESLint `no-explicit-any` 관련 타입 개선 및 askLogs/CHANGELOG 기록 가이드 강화
