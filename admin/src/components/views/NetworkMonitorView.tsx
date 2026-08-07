// admin/src/components/views/NetworkMonitorView.tsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalLogEntry, NetworkHealthResponse, PingTestResult, ApiSpeedTestResult } from '../../types/index.js';

/** 네트워크 모니터링 뷰 Props */
interface NetworkMonitorViewProps {
  /** 웹소켓 메시지 전송 함수 */
  onDispatch: (targetId: string, action: string, payloadStr: string) => boolean;
  /** 활성 클라이언트 수 */
  clientCount: number;
}

/**
 * 네트워크 모니터링 뷰 컴포넌트입니다.
 * 백엔드 서버, 수집 노드 간의 실시간 네트워크 상태 진단, Ping/Pong 테스트, REST API 헬스체크,
 * 터미널 스타일 CLI 콘솔을 제공합니다.
 */
export function NetworkMonitorView({ onDispatch, clientCount }: NetworkMonitorViewProps) {
  /** 터미널 콘솔 로그 엔트리 배열 상태 */
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  
  /** 프로で敗프트 입력값 상태 */
  const [commandInput, setCommandInput] = useState('');
  
  /** 자동 스크롤 여부 상태 */
  const [autoScroll, setAutoScroll] = useState(true);
  
  /** 콘솔 출력창 DOM 참조 */
  const consoleOutputRef = useRef<HTMLDivElement>(null);
  
  /** 고유 로그 ID 생성기 */
  const generateLogId = useCallback(() => {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }, []);
  
  /** 터미널에 로그 추가 헬퍼 함수 */
  const addTerminalLog = useCallback((
    text: string,
    type: TerminalLogEntry['type'] = 'info'
  ) => {
    const newLog: TerminalLogEntry = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      type,
      text,
    };
    setTerminalLogs((prev) => [...prev, newLog]);
  }, [generateLogId]);
  
  /** 터미널 콘솔 자동 스크롤 */
  useEffect(() => {
    if (autoScroll && consoleOutputRef.current) {
      const element = consoleOutputRef.current;
      const scrollBehavior = element.style.scrollBehavior;
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
      element.style.scrollBehavior = scrollBehavior;
    }
  }, [terminalLogs, autoScroll]);
  
  /** 명령어 실행 핸들러 */
  const executeCommand = useCallback((command: string) => {
    if (!command.trim()) return;
    
    addTerminalLog(`> ${command}`, 'cmd');
    
    // 명령어 파싱
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // help 명령어
    if (cmd === 'help') {
      addTerminalLog('사용 가능한 명령어:', 'info');
      addTerminalLog('  help       - 이 도움말 표시', 'info');
      addTerminalLog('  health     - 서버 헬스체크 실행', 'info');
      addTerminalLog('  ping       - 모든 노드에 핑 테스트 실행', 'info');
      addTerminalLog('  ping <id>  - 특정 노드에 핑 테스트 실행', 'info');
      addTerminalLog('  api        - REST API 속도 진단', 'info');
      addTerminalLog('  sessions   - 활성 세션 수 표시', 'info');
      addTerminalLog('  clear      - 콘솔 내용 비우기', 'info');
      return;
    }
    
    // clear 명령어
    if (cmd === 'clear') {
      setTerminalLogs([]);
      addTerminalLog('콘솔이 비워졌습니다.', 'success');
      return;
    }
    
    // health 명령어
    if (cmd === 'health') {
      executeHealthCheck();
      return;
    }
    
    // ping 명령어
    if (cmd === 'ping') {
      if (args.length === 0) {
        executePingAll();
      } else {
        executePingTest(args[0]);
      }
      return;
    }
    
    // api 명령어
    if (cmd === 'api') {
      executeApiSpeedTest();
      return;
    }
    
    // sessions 명령어
    if (cmd === 'sessions') {
      addTerminalLog(`활성 세션 수: ${clientCount}개`, 'success');
      return;
    }
    
    // 알 수 없는 명령어
    addTerminalLog(`알 수 없는 명령어: ${cmd}. 'help'를 입력하여 도움말을 확인하세요.`, 'error');
  }, [addTerminalLog, clientCount]);
  
  /** 서버 헬스체크 실행 */
  const executeHealthCheck = useCallback(async () => {
    addTerminalLog('서버 헬스체크를 실행합니다...', 'info');
    
    try {
      const startTime = Date.now();
      const response = await fetch('/api/admin/network/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data: { success: boolean; data: NetworkHealthResponse } = await response.json();
        if (data.success) {
          const health = data.data;
          addTerminalLog(`[서버 헬스체크 성공] 포트: ${health.port}, 바인딩: ${health.portBound ? '정상' : '비정상'}`, 'success');
          addTerminalLog(`  업타임: ${health.uptime ? '정상' : '비정상'}, 시작 시각: ${new Date(health.startedAt).toLocaleTimeString()}`, 'success');
          addTerminalLog(`  WAL 모드: ${health.walModeEnabled ? '활성' : '비활성'}, 메모리: ${health.memoryUsage}MB`, 'success');
          addTerminalLog(`  응답 시간: ${responseTime}ms`, 'success');
        } else {
          addTerminalLog(`서버 헬스체크 실패: ${data.message || '알 수 없는 오류'}`, 'error');
        }
      } else {
        addTerminalLog(`서버 헬스체크 실패: HTTP ${response.status}`, 'error');
      }
    } catch (error) {
      addTerminalLog(`서버 헬스체크 중 오류 발생: ${error}`, 'error');
    }
  }, [addTerminalLog]);
  
  /** 모든 노드 핑 테스트 실행 */
  const executePingAll = useCallback(() => {
    addTerminalLog(`모든 노드(${clientCount}개)에 핑 테스트를 실행합니다...`, 'info');
    
    const targetId = 'ALL';
    const success = onDispatch(targetId, 'PING_TEST', JSON.stringify({ timestamp: Date.now() }));
    
    if (success) {
      addTerminalLog('핑 테스트 패킷 전송 성공. 응답을 대기 중...', 'success');
    } else {
      addTerminalLog('핑 테스트 패킷 전송 실패: 소켓 연결 상태를 확인하세요.', 'error');
    }
  }, [addTerminalLog, clientCount, onDispatch]);
  
  /** 특정 노드 핑 테스트 실행 */
  const executePingTest = useCallback((targetId: string) => {
    addTerminalLog(`노드 [${targetId}]에 핑 테스트를 실행합니다...`, 'info');
    
    const success = onDispatch(targetId, 'PING_TEST', JSON.stringify({ timestamp: Date.now() }));
    
    if (success) {
      addTerminalLog(`핑 테스트 패킷 전송 성공. 응답을 대기 중...`, 'info');
    } else {
      addTerminalLog(`핑 테스트 패킷 전송 실패: 노드 [${targetId}]가 연결되어 있지 않습니다.`, 'error');
    }
  }, [addTerminalLog, onDispatch]);
  
  /** REST API 속도 진단 실행 */
  const executeApiSpeedTest = useCallback(async () => {
    addTerminalLog('REST API 속도 진단을 실행합니다...', 'info');
    
    const endpoints = [
      '/api/db/clients',
      '/api/db/logs',
      '/api/admin/workers',
    ];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (response.ok) {
          addTerminalLog(`[API 속도 진단] ${endpoint}: ${responseTime}ms (성공)`, 'success');
        } else {
          addTerminalLog(`[API 속도 진단] ${endpoint}: HTTP ${response.status} (실패)`, 'error');
        }
      } catch (error) {
        addTerminalLog(`[API 속도 진단] ${endpoint}: 오류 발생 - ${error}`, 'error');
      }
    }
  }, [addTerminalLog]);
  
  /** 터미널 로그 복사 핸들러 */
  const handleCopyLogs = useCallback(() => {
    const logText = terminalLogs.map((log) => `[${log.timestamp}] [${log.type}] ${log.text}`).join('\n');
    navigator.clipboard.writeText(logText);
    addTerminalLog('터미널 로그가 클립보드로 복사되었습니다.', 'success');
  }, [terminalLogs, addTerminalLog]);
  
  /** 콘솔 초기화 핸들러 */
  const handleClearConsole = useCallback(() => {
    setTerminalLogs([]);
    addTerminalLog('콘솔이 초기화되었습니다.', 'info');
  }, [addTerminalLog]);
  
  /** 키보드 입력 핸들러 */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
      setCommandInput('');
    }
  }, [commandInput, executeCommand]);
  
  /** 상단 버튼 클릭 핸들러 */
  const handleButtonClick = useCallback((action: string) => {
    switch (action) {
      case 'health':
        executeHealthCheck();
        break;
      case 'ping':
        executePingAll();
        break;
      case 'api':
        executeApiSpeedTest();
        break;
      case 'sessions':
        addTerminalLog(`활성 세션 수: ${clientCount}개`, 'success');
        break;
    }
  }, [executeHealthCheck, executePingAll, executeApiSpeedTest, addTerminalLog, clientCount]);
  
  // 구성 요소 초기 로딩 시 환영 메시지 출력
  useEffect(() => {
    addTerminalLog('=== WebCrawlServer 네트워크 모니터링 콘솔 ===', 'info');
    addTerminalLog('도움말은 \'help\' 명령을 입력하세요.', 'info');
  }, [addTerminalLog]);
  
  // 로그 타입에 따른 텍스트 색상 반환
  const getLogTextColor = useCallback((type: TerminalLogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-rose-400';
      case 'warning':
        return 'text-amber-400';
      case 'cmd':
        return 'text-sky-400';
      default:
        return 'text-slate-300';
    }
  }, []);
  
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 상단 진단 버튼 패널 */}
      <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 bg-[#28292c]">
          <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
            네트워크 진단 명령 패널
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleButtonClick('health')}
            className="flex flex-col items-center gap-2 p-3 bg-[#111827] hover:bg-[#1E293B] rounded border border-slate-800 transition group"
          >
            <span className="material-symbols-outlined text-xl text-blue-400">monitoring</span>
            <span className="text-xs text-slate-300 font-medium">서버 헬스체크</span>
          </button>
          
          <button
            onClick={() => handleButtonClick('ping')}
            className="flex flex-col items-center gap-2 p-3 bg-[#111827] hover:bg-[#1E293B] rounded border border-slate-800 transition group"
          >
            <span className="material-symbols-outlined text-xl text-green-400">lan</span>
            <span className="text-xs text-slate-300 font-medium">전체 노드 핑 테스트</span>
          </button>
          
          <button
            onClick={() => handleButtonClick('api')}
            className="flex flex-col items-center gap-2 p-3 bg-[#111827] hover:bg-[#1E293B] rounded border border-slate-800 transition group"
          >
            <span className="material-symbols-outlined text-xl text-purple-400">speed</span>
            <span className="text-xs text-slate-300 font-medium">API 속도 진단</span>
          </button>
          
          <button
            onClick={() => handleButtonClick('sessions')}
            className="flex flex-col items-center gap-2 p-3 bg-[#111827] hover:bg-[#1E293B] rounded border border-slate-800 transition group"
          >
            <span className="material-symbols-outlined text-xl text-orange-400">group</span>
            <span className="text-xs text-slate-300 font-medium">세션 가동률</span>
          </button>
        </div>
      </div>
      
      {/* 하단 터미널 콘솔 출력 창 */}
      <div className="flex-1 flex flex-col bg-[#0D1117] rounded border border-slate-800 shadow-sm overflow-hidden">
        {/* 콘솔 헤더 */}
        <div className="px-4 py-2 bg-[#1E293B] border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">터미널 콘솔 (Ctrl+C: 복사, Ctrl+L: 지우기)</span>
          <div className="flex gap-2">
            <button
              onClick={handleClearConsole}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition"
            >
              콘솔 소거
            </button>
            <button
              onClick={handleCopyLogs}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition"
            >
              로그 복사
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs px-3 py-1 rounded transition ${
                autoScroll
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              자동 스크롤 {autoScroll ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        
        {/* 콘솔 출력 창 */}
        <div
          ref={consoleOutputRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-xs"
        >
          {terminalLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-20">
              터미널 콘솔 준비 완료
            </div>
          ) : (
            terminalLogs.map((log) => (
              <div key={log.id} className={`break-all ${getLogTextColor(log.type)}`}>
                <span className="text-slate-600 mr-2">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                {log.text}
              </div>
            ))
          )}
        </div>
        
        {/* 명령어 입력 줄 */}
        <div className="px-4 py-2 bg-[#1E293B] border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-bold">&gt;</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="명령어 입력 (help, health, ping, api, clear...)"
              className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
