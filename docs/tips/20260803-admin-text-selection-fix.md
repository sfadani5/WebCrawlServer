# 관리자 페이지 텍스트 선택 문제 해결 기록

## 문제
admin 페이지에서 마우스로 드래그 하면 텍스트가 선택되지 않는 문제가 모든 영역에서 발생했습니다.

## 원인 분석

Tailwind CSS의 `select-none` 클래스가 여러 컴포넌트에서 사용되고 있었으며, 이는 `user-select: none` CSS 속성을 적용하여 텍스트 선택을 방지합니다.

此外, `select-text` 클래스가 일부 컴포넌트에서 사용되고 있었으나, 이는 Tailwind CSS에 존재하지 않는 유효하지 않은 클래스이므로 아무 효과가 없습니다.

### 문제가 발생한 파일 및 위치

| 파일 경로 | 라인 | 클래스 | 문제 유형 |
|---|---|---|---|
| `admin/src/components/layout/Sidebar/Sidebar.tsx` | 20, 34 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/Navbar/TopBar.tsx` | 14 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx` | 17 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/metrics/MetricCardsGroup.tsx` | 10 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/tables/GcpClientsTable.tsx` | 57, 121 | `select-text`, `select-none` | 유효하지 않은 클래스 및 선택 방지 |
| `admin/src/components/views/GcpClientsView.tsx` | 97 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/views/WorkerManagerView.tsx` | 98 | `select-none`, `select-text` | 중복 및 유효하지 않은 클래스 |
| `admin/src/components/modals/NodeConfigModal.tsx` | 75 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/modals/DomDataModal.tsx` | 34, 37, 85, 95, 102 | `select-text`, `select-none` | 유효하지 않은 클래스 및 선택 방지 |
| `admin/src/components/layout/Header.tsx` | 10 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/Footer.tsx` | 7 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/Navbar/HeaderTools.tsx` | 10 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/Navbar/GlobalSearchBar.tsx` | 3 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/Navbar/ProjectSelector.tsx` | 8 | `select-none` | 텍스트 선택 방지 |
| `admin/src/components/layout/GcpMainLayout.tsx` | 48 | `select-text` | 유효하지 않은 클래스 |
| `admin/src/components/views/GcpCrawlLogsView.tsx` | 24 | `select-text` | 유효하지 않은 클래스 |
| `admin/src/components/views/CrawlLogsView.tsx` | 22, 32 | `select-text` | 유효하지 않은 클래스 |
| `admin/src/components/views/ClientsView.tsx` | 18 | `select-text` | 유효하지 않은 클래스 |

## 해결 방안

### 1. `select-none` 클래스 제거
所有 컴포넌트에서 `select-none` 클래스를 제거하여 기본 텍스트 선택 동작을 복원했습니다.

**이유:**
- `select-none`은 사용자 인터랙션을 방해하며, 주로 버튼이나 아이콘과 같은 비텍스트 요소에서만 사용해야 합니다.
- 관리자 페이지의 대부분의 영역은 텍스트 콘텐츠를 포함하고 있으며, 사용자는 이 텍스트를 선택하여 복사하거나 참조해야 합니다.

### 2. `select-text` 클래스를 제거
모든 `select-text` 클래스를 제거했습니다.

**이유:**
- `select-text`는 Tailwind CSS의 기본 클래스가 아닙니다.
- Tailwind CSS에서 텍스트 선택을 허용하는 클래스는 `select-auto`입니다.
- 기본적으로 브라우저는 텍스트 선택을 허용하므로, 아무런 클래스를 적용하지 않아도 되는 것이 가장 좋습니다.

## 수정된 파일 목록

1. `admin/src/components/layout/Sidebar/Sidebar.tsx`
2. `admin/src/components/layout/Navbar/TopBar.tsx`
3. `admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx`
4. `admin/src/components/metrics/MetricCardsGroup.tsx`
5. `admin/src/components/tables/GcpClientsTable.tsx`
6. `admin/src/components/views/GcpClientsView.tsx`
7. `admin/src/components/views/WorkerManagerView.tsx`
8. `admin/src/components/modals/NodeConfigModal.tsx`
9. `admin/src/components/modals/DomDataModal.tsx`
10. `admin/src/components/layout/Header.tsx`
11. `admin/src/components/layout/Footer.tsx`
12. `admin/src/components/layout/Navbar/HeaderTools.tsx`
13. `admin/src/components/layout/Navbar/GlobalSearchBar.tsx`
14. `admin/src/components/layout/Navbar/ProjectSelector.tsx`
15. `admin/src/components/layout/GcpMainLayout.tsx`
16. `admin/src/components/views/GcpCrawlLogsView.tsx`
17. `admin/src/components/views/CrawlLogsView.tsx`
18. `admin/src/components/views/ClientsView.tsx`

## 검증 방법

1. admin 페이지를 실행합니다: `npm run admin:dev`
2. 마우스로 텍스트를 드래그합니다.
3. 텍스트가 정상적으로 선택되는지 확인합니다.
4. 선택된 텍스트를 복사할 수 있는지 확인합니다.

## 주의 사항

- 버튼이나 아이콘과 같은 인터랙티브 요소에서는 `select-none`을 유지할 수 있습니다.
- 그러나 majority의 경우, 기본 동작을 유지하는 것이 가장 좋습니다.
- future에 텍스트 선택을 비활성화해야 하는 특별한 경우에만 `select-none`을 사용해야 합니다.

## 관련 규칙

- R-00302 admin-ui-ux-guidelines.md: 접근성 섹션 3.4에서 "선택 불가 텍스트(`select-none`)는 인터랙티브 요소가 아닌 경우에만 사용"이라고 명시되어 있습니다.
- 본 수정은 해당 가이드라인을 준수하여, 인터랙티브가 아닌 모든 영역에서 `select-none`을 제거했습니다.
