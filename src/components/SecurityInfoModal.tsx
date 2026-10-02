import React, { useState } from 'react';
import { X, ShieldCheck, Database, Key, Server, Copy, Check, ExternalLink } from 'lucide-react';
import { firebaseConfig } from '../lib/firebase';

interface SecurityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInfoModal: React.FC<SecurityInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envExampleContent = `# GEMINI_API_KEY: Server-side Gemini AI API key (Google AI Studio & Vercel serverless / Express)
# AI Studio automatically injects this at runtime from user secrets.
# For Vercel Serverless / Node.js backend: process.env.GEMINI_API_KEY
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# VITE_GEMINI_API_KEY: Client-side Gemini API key fallback (Optional, for client-only / static Vercel builds)
# Set this in Vercel Project Settings > Environment Variables if running client-only
VITE_GEMINI_API_KEY=""

# APP_URL: The URL where this applet is hosted.
APP_URL="http://localhost:3000"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm font-sans">
                보안 요구사항 및 Firebase 연동 안내
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                API 키 안전 보관 및 데이터베이스 구성 현황
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm font-sans text-stone-700 leading-relaxed">
          {/* Section 1: API Key Security */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
              <Key className="w-4 h-4 text-amber-600" />
              <span>1. Gemini API 키 보안 처리 (하드코딩 방지)</span>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
              <p>
                본 앱은 Google의 보안 권장 사항에 따라 <strong>소스 코드에 API 키를 직접 노출하지 않습니다</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>
                  <strong>서버 사이드 프록시 (권장):</strong> Node.js / Express 서버(<code>server.ts</code>)에서 <code>process.env.GEMINI_API_KEY</code>를 통해 안전하게 모델을 호출합니다.
                </li>
                <li>
                  <strong>Vercel 정적 배포 지원:</strong> Vercel 배포 시 프로젝트의 <em>Environment Variables</em>에 <code>GEMINI_API_KEY</code> 또는 <code>VITE_GEMINI_API_KEY</code>를 등록하면 자동으로 감지하여 작동합니다.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: .env.example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900 text-xs uppercase tracking-wide">
                로컬 테스트용 .env.example 파일
              </span>
              <button
                onClick={() => copyToClipboard(envExampleContent, 'env')}
                className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'env' ? '복사됨' : '복사하기'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-stone-900 text-stone-200 text-xs font-mono overflow-x-auto leading-relaxed">
              {envExampleContent}
            </pre>
          </div>

          {/* Section 3: Firebase Config */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>2. 사용자 지정 Firebase 데이터베이스 연동</span>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
              <p>
                제공해주신 Firebase 설정(프로젝트 ID: <code>{firebaseConfig.projectId}</code>)을 기반으로 Firestore 데이터베이스와 연동되었습니다.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[11px]">Project ID</span>
                  <span className="font-mono font-medium text-stone-800">{firebaseConfig.projectId}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[11px]">Auth Domain</span>
                  <span className="font-mono font-medium text-stone-800">{firebaseConfig.authDomain}</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                * 오프라인 환경이나 네트워크 불안정 시에도 소중한 일기가 유실되지 않도록 브라우저 로컬 저장소와 자동 양방향 동기화(Dual-sync)됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg font-sans transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
