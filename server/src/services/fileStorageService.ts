// server/src/services/fileStorageService.ts

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/** 파일 저장 옵션 구조체 */
export interface SaveContentOptions {
  /** 노드 전용 물리 저장 경로 (최우선 적용) */
  customNodePath?: string;
  /** 워커 전용 물리 저장 경로 (노드 미지정 시 적용) */
  workerStoragePath?: string;
  /** 글로벌 기본 저장 경로 (기본값: "./storage") */
  globalDefaultPath?: string;
  /** 수집 도메인 (예: "aaa.com") */
  domain: string;
  /** DB 레코드 인덱스 ID (예: 1042) */
  dbLogId: number | string;
  /** 저장할 HTML 원본 소스 문자열 */
  htmlContent: string;
}

/** 파일 저장 결과 구조체 */
export interface SaveContentResult {
  /** 최종 저장된 절대 파일 경로 */
  savedFilePath: string;
  /** 저장된 파일 크기 (Bytes) */
  fileSize: number;
}

/**
 * 윈도우 및 리눅스 디렉터리명에 허용되지 않는 특수문자를 언더스코어로 정화합니다.
 *
 * @param name - 정화할 원본 문자열
 * @returns 안전한 파일/폴더명 문자열
 */
function sanitizeFolderName(name: string): string {
  return (name || "common").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/**
 * 우선순위(노드 전용 > 워커 전용 > 글로벌 기본)에 따라 물리 저장 경로를 결정하고,
 * 수집된 HTML 콘텐츠를 도메인/ID 구조의 디렉터리에 index.html 파일로 디스크에 보관합니다.
 *
 * @param options - 파일 저장 옵션 객체
 * @returns 저장된 파일 경로 및 크기 정보
 */
export function saveCrawledContentToFile(
  options: SaveContentOptions
): SaveContentResult {
  // 1. 저장소 최상위 루트 경로 결정 (우선순위: 노드 지정 > 워커 지정 > 글로벌 기본)
  const rootPath =
    options.customNodePath && options.customNodePath.trim().length > 0
      ? options.customNodePath
      : options.workerStoragePath && options.workerStoragePath.trim().length > 0
      ? options.workerStoragePath
      : options.globalDefaultPath || "./storage";

  // 2. 도메인 특수문자 정화 후 세부 디렉터리 경로 구성 (예: ./storage/aaa_com/1042/)
  const safeDomain = sanitizeFolderName(options.domain);
  const targetDir = resolve(
    rootPath,
    safeDomain,
    String(options.dbLogId)
  );

  // 3. 대상 디렉터리 없을 경우 재귀적으로 자동 생성
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 4. index.html 파일 쓰기 단행
  const targetFilePath = resolve(targetDir, "index.html");
  const buffer = Buffer.from(options.htmlContent, "utf-8");

  writeFileSync(targetFilePath, buffer);

  return {
    savedFilePath: targetFilePath,
    fileSize: buffer.length,
  };
}
