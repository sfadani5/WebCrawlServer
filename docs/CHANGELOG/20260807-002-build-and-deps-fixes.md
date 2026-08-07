# 변경 이력: 빌드 및 의존성 수정 (admin 빌드, server 컴파일)

## 문서 메타
- **변경 분류**: 빌드 환경 / 의존성 수정
- **변경 일시**: 2026-08-07
- **작성자**: GitHub Copilot
- **상태**: 완료

---

## 요약
관리자 프론트엔드(`admin`) 빌드 실패 원인으로 로컬에 `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer` 등의 개발 의존성이 누락되어 있음을 확인하고 설치하여 `admin` 빌드를 성공시켰습니다. 또한 서버(`server`)의 TypeScript 컴파일을 위해 `server/package.json`에 `build` 스크립트를 추가하고, 루트/워크스페이스에 `typescript` 및 필요한 `@types/*` 패키지들을 설치하여 `server` 컴파일을 성공적으로 수행했습니다.

---

## 주요 변경 사항
- `admin` 측: 개발 의존성 추가(설치)
  - 설치: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`
  - 결과: `npm run build` 성공, 출력물이 `server/public`으로 정상 생성됨

- `server` 측: 빌드 스크립트 추가 및 타입 설치
  - `server/package.json`에 `"build": "tsc -p tsconfig.json"` 추가
  - 루트에 `typescript` 및 `@types/express`, `@types/ws`, `@types/better-sqlite3` 설치
  - 명령: `npm run build --workspace=server` 실행 후 컴파일 성공 (`server/dist` 생성)

---

## 권장 후속 작업
- CI 환경(혹은 배포 서버)에서 동일한 의존성/빌드 스텝을 재현하도록 `README` 또는 CI 설정(`.github/workflows` 등)에 빌드 스크립트 추가 권장
- `package.json` 의존성 목록과 workspace 사용 정책을 검토하여 devDependencies의 일관성 확보 권장
