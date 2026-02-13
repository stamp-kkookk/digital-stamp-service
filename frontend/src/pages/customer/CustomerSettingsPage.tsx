/**
 * CustomerSettingsPage 컴포넌트
 * 고객 앱 설정 페이지
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Clock } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { isStepUpValid, getStepUpRemainingSeconds } from '@/lib/api/tokenManager';
import { StepUpVerify } from '@/components/shared/StepUpVerify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Modal';

export function CustomerSettingsPage() {
  const { customerNavigate } = useCustomerNavigate();
  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());
  const [showOtpFlow, setShowOtpFlow] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const remainingSec = stepUpValid ? getStepUpRemainingSeconds() : 0;
  const remainingMin = Math.ceil(remainingSec / 60);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10">
        <button
          onClick={() => customerNavigate('/wallet')}
          className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg ml-2 text-kkookk-navy">설정</h1>
      </div>

      {/* 설정 목록 */}
      <div className="border-t border-slate-100">
        {/* 본인 인증 */}
        <div className="p-4 border-b border-slate-50">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => !stepUpValid && setShowOtpFlow(!showOtpFlow)}
            role={stepUpValid ? undefined : 'button'}
            tabIndex={stepUpValid ? undefined : 0}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className={stepUpValid ? 'text-green-500' : 'text-kkookk-steel'} />
              <span className="text-kkookk-navy font-medium">본인 인증</span>
            </div>
            {stepUpValid ? (
              <div className="flex items-center gap-1.5 text-green-600">
                <Clock size={14} />
                <span className="text-xs font-medium">{remainingMin}분 남음</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-kkookk-orange-500 bg-kkookk-orange-50 px-3 py-1 rounded-full">
                인증하기
              </span>
            )}
          </div>

          {/* 인라인 OTP 플로우 */}
          {showOtpFlow && !stepUpValid && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <StepUpVerify
                onVerified={() => {
                  setStepUpValid(true);
                  setShowOtpFlow(false);
                }}
              />
            </div>
          )}
        </div>

        {/* 알림 설정 (비활성) */}
        <div className="p-4 border-b border-slate-50 flex justify-between items-center opacity-40 cursor-not-allowed">
          <span className="text-kkookk-navy font-medium">알림 설정</span>
          <div className="w-10 h-6 bg-slate-300 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>

        <div
          className="p-4 border-b border-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-50"
          onClick={() => setShowPrivacyPolicy(true)}
          role="button"
          tabIndex={0}
        >
          <span className="text-kkookk-navy font-medium">개인정보 처리방침</span>
          <ChevronRight size={16} className="text-kkookk-steel" />
        </div>
        <div className="p-4 flex justify-between items-center">
          <span className="text-kkookk-navy font-medium">버전 정보</span>
          <span className="text-kkookk-steel text-sm">v1.0.0</span>
        </div>
      </div>

      {/* 개인정보 처리방침 모달 */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="max-h-[85vh] flex flex-col mx-4 max-w-lg">
          <DialogHeader>
            <DialogTitle>개인정보 처리방침</DialogTitle>
            <DialogDescription>v1.0 | 시행일자: 2026년 2월 13일</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 text-sm text-kkookk-navy leading-relaxed space-y-5">
            <p>
              <strong>꾸욱(KKOOKK)</strong>은 이용자의 개인정보를 소중하게 여기며, 「개인정보 보호법」 등 관련 법령을 준수하고
              있습니다. 본 방침을 통해 수집된 정보가 어떤 용도로 사용되는지 투명하게 안내드립니다.
            </p>

            <div>
              <h3 className="font-bold text-base mb-2">1. 개인정보의 수집 및 이용 목적</h3>
              <p className="mb-2 text-kkookk-steel">
                회사는 다음의 목적을 위해 최소한의 개인정보를 수집합니다. 수집된 정보는 목적 외의 용도로 이용되지 않으며, 이용
                목적이 변경될 시에는 사전 동의를 구할 예정입니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-kkookk-steel">
                <li><strong>회원 식별 및 관리</strong>: 서비스 이용에 따른 본인 확인 및 부정 이용 방지</li>
                <li><strong>보안 인증(OTP)</strong>: 리딤(쿠폰 사용) 및 주요 기능 접근 시 스텝업 인증 수행</li>
                <li><strong>서비스 제공</strong>: 디지털 스탬프 적립, 리워드 제공, 기존 종이 스탬프 마이그레이션 요청 처리</li>
                <li><strong>고객 응대</strong>: 서비스 관련 고지사항 전달 및 불만 처리</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">2. 수집하는 개인정보 항목</h3>
              <ul className="list-disc pl-5 space-y-1 text-kkookk-steel">
                <li><strong>필수 항목</strong>: 이름, 휴대전화번호</li>
                <li>
                  <strong>서비스 이용 과정에서 생성되는 정보</strong>: 서비스 이용 기록, 접속 로그, 쿠키, 기기 정보(기기 모델,
                  OS 버전), 적립/리딤/이전 내역
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">3. 개인정보의 보유 및 이용 기간</h3>
              <ul className="list-disc pl-5 space-y-1 text-kkookk-steel">
                <li><strong>원칙</strong>: 이용자의 개인정보는 회원 탈퇴 시 즉시 파기합니다.</li>
                <li>
                  <strong>예외 보관</strong>:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>부정 이용 방지 및 감사 로그: 탈퇴 후 6개월간 보관</li>
                    <li>관계 법령에 따라 보존이 필요한 경우 해당 법령이 정한 기간 동안 보관</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">4. 개인정보 처리 위탁</h3>
              <p className="text-kkookk-steel">
                원활한 서비스 제공을 위해 본인 확인을 위한 OTP 인증 및 카카오 알림톡/문자 발송 업무를 외부 업체에 위탁하고
                있습니다.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">5. 이용자의 권리 및 거부권</h3>
              <p className="text-kkookk-steel">
                이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 이름 및 휴대전화번호 수집에 동의하지
                않으실 경우, 본인 확인 기반의 스탬프 적립 및 리딤 서비스 이용이 제한됩니다.
              </p>
            </div>

            <p className="text-xs text-kkookk-steel pt-2 border-t border-slate-100">
              공고일자: 2026년 2월 13일 | 시행일자: 2026년 2월 13일
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerSettingsPage;
