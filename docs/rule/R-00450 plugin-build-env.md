# R-00450 docs/rule/R-00450 plugin-build-env.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 빌드 및 환경변수 지침입니다. Vite 빌드 도구의 `define` 옵션을 이용하여 빌드 시점에 환경변수 및 규격 상수를 치환 주입하는 방식과 커스텀 빌드 절차를 정의합니다.

---

## 1. 개요 및 목적

1.1 **빌드 타임 치환**: 런타임 환경변수 파싱 오버헤드를 없애고, `npm run build` 실행 시점에 Node.js 환경변수값을 자바스크립트 산출물(`dist/*.js`) 내의 **리터럴 상수 값으로 직접 치환 주입**합니다.  
1.2 **설정 이원화 방지**: 팝업 크기, 최소/최대 규격, 백엔드 서버 호스트 및 포트 설정을 중앙 모듈에서 일관되게 관리합니다.  

---

## 2. 주입 대상 환경 변수 및 기본값 규격

플러그인 빌드 시 주입되는 전역 상수 및 기본값 스펙은 아래 표와 같습니다.

| 변수명 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `POPUP_WIDTH` | `number` | `360` | 팝업 창 초기 기본 가로 너비 (px) |
| `POPUP_HEIGHT` | `number` | `480` | 팝업 창 초기 기본 세로 높이 (px) |
| `POPUP_MIN_WIDTH` | `number` | `320` | 마우스 드래그 리사이즈 최소 가로 너비 (px) |
| `POPUP_MIN_HEIGHT` | `number` | `420` | 마우스 드래그 리사이즈 최소 세로 높이 (px) |
| `POPUP_MAX_WIDTH` | `number` | `600` | 마우스 드래그 리사이즈 최대 가로 너비 (px) |
| `POPUP_MAX_HEIGHT` | `number` | `700` | 마우스 드래그 리사이즈 최대 세로 높이 (px) |
| `SERVER_HOST` | `string` | `"localhost"` | 백엔드 WebCrawlServer 호스트 주소 |
| `SERVER_PORT` | `number` | `9600` | 백엔드 통합 서비스 포트 번호 |

---

## 3. Vite Define 설정 규정 (`vite.config.ts`)

`vite.config.ts` 파일의 `define` 옵션에 아래와 같이 `process.env` 값을 매핑하도록 작성해야 합니다.

```typescript
// plugins/basic-plugin/vite.config.ts

export default defineConfig({
  plugins: [react()],
  define: {
    __POPUP_WIDTH__: Number(process.env.POPUP_WIDTH || 360),
    __POPUP_HEIGHT__: Number(process.env.POPUP_HEIGHT || 480),
    __POPUP_MIN_WIDTH__: Number(process.env.POPUP_MIN_WIDTH || 320),
    __POPUP_MIN_HEIGHT__: Number(process.env.POPUP_MIN_HEIGHT || 420),
    __POPUP_MAX_WIDTH__: Number(process.env.POPUP_MAX_WIDTH || 600),
    __POPUP_MAX_HEIGHT__: Number(process.env.POPUP_MAX_HEIGHT || 700),
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  // ... 생략
});
```

---

## 4. 전역 타입 선언 및 설정 모듈 지침

4.1 **타입 선언 (`src/types/env.d.ts`)**:
   - `declare const __POPUP_WIDTH__: number;` 형태로 전역 상수를 선언합니다.
   - 개발자가 각 상수의 역할, 단위, 출처를 즉시 파악할 수 있도록 **매우 자세한 한글 주석**을 작성해야 합니다.
4.2 **중앙 설정 모듈 (`src/config/pluginConfig.ts`)**:
   - 주입된 상수를 `PLUGIN_CONFIG` 객체로 통합 포장하여 외부 모듈로 내보냅니다.
   - `getWebSocketUrl(clientId)`과 같이 주입된 포트/호스트 기반의 URL 생성 헬퍼 함수를 제공합니다.

---

## 5. 커스텀 환경변수 빌드 절차

개발자 또는 CI/CD 파이프라인에서 기본값이 아닌 커스텀 환경변수를 주입하여 빌드하는 명령 예시는 다음과 같습니다.

### PowerShell 7 커스텀 빌드 예시
```powershell
# 가로 400px, 세로 520px, 포트 9600 빌드 실행
$env:POPUP_WIDTH="400"; $env:POPUP_HEIGHT="520"; $env:SERVER_PORT="9600"; npm run build --workspace=basic-plugin
```

### CMD 커스텀 빌드 예시
```cmd
set POPUP_WIDTH=400&& set POPUP_HEIGHT=520&& set SERVER_PORT=9600&& npm run build --workspace=basic-plugin
```

### 산출물 검증
빌드 완료 후 `dist/popup.js` 및 `dist/background.js` 파일을 확인하여 전역 매크로 변수가 지정한 리터럴 숫자로 치환되어 배출되었는지 검증합니다.
