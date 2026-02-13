/**
 * PrivacyPolicyModal 컴포넌트
 * 개인정보 처리방침을 모달로 표시
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({
  open,
  onOpenChange,
}: PrivacyPolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="mx-4 max-w-md max-h-[85vh] flex flex-col rounded-2xl"
        aria-describedby="privacy-policy-description"
      >
        <DialogHeader>
          <DialogTitle>개인정보 처리방침</DialogTitle>
          <DialogDescription id="privacy-policy-description">
            v1.0 | 시행일자: 2026년 2월 13일
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 text-sm text-kkookk-navy leading-relaxed">
          <p className="my-4">
            <strong>꾸욱(KKOOKK)</strong>은 이용자의 개인정보를 소중하게 여기며,
            「개인정보 보호법」 등 관련 법령을 준수하고 있습니다. 본 방침을 통해
            수집된 정보가 어떤 용도로 사용되는지 투명하게 안내드립니다.
          </p>

          <h3 className="mt-6 mb-2 text-base font-semibold">
            1. 개인정보의 수집 및 이용 목적
          </h3>
          <p className="mb-2">
            회사는 다음의 목적을 위해 최소한의 개인정보를 수집합니다. 수집된
            정보는 목적 외의 용도로 이용되지 않으며, 이용 목적이 변경될 시에는
            사전 동의를 구할 예정입니다.
          </p>
          <ul className="mb-4 ml-4 list-disc space-y-1">
            <li>
              <strong>회원 식별 및 관리</strong>: 서비스 이용에 따른 본인 확인
              및 부정 이용 방지
            </li>
            <li>
              <strong>보안 인증(OTP)</strong>: 리딤(쿠폰 사용) 및 주요 기능 접근
              시 스텝업 인증 수행
            </li>
            <li>
              <strong>서비스 제공</strong>: 디지털 스탬프 적립, 리워드 제공,
              기존 종이 스탬프 마이그레이션 요청 처리
            </li>
            <li>
              <strong>고객 응대</strong>: 서비스 관련 고지사항 전달 및 불만 처리
            </li>
          </ul>

          <h3 className="mt-6 mb-2 text-base font-semibold">
            2. 수집하는 개인정보 항목
          </h3>
          <ul className="mb-4 ml-4 list-disc space-y-1">
            <li>
              <strong>필수 항목</strong>: 이름, 휴대전화번호
            </li>
            <li>
              <strong>서비스 이용 과정에서 생성되는 정보</strong>: 서비스 이용
              기록, 접속 로그, 쿠키, 기기 정보(기기 모델, OS 버전),
              적립/리딤/이전 내역
            </li>
          </ul>

          <h3 className="mt-6 mb-2 text-base font-semibold">
            3. 개인정보의 보유 및 이용 기간
          </h3>
          <ul className="mb-4 ml-4 list-disc space-y-1">
            <li>
              <strong>원칙</strong>: 이용자의 개인정보는 회원 탈퇴 시 즉시
              파기합니다.
            </li>
            <li>
              <strong>예외 보관</strong>:
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>
                  부정 이용 방지 및 감사 로그: 탈퇴 후 6개월간 보관 (내부 방침)
                </li>
                <li>
                  관계 법령(전자상거래법 등)에 따라 보존이 필요한 경우 해당
                  법령이 정한 기간 동안 보관
                </li>
              </ul>
            </li>
          </ul>

          <h3 className="mt-6 mb-2 text-base font-semibold">
            4. 개인정보 처리 위탁
          </h3>
          <p className="mb-2">
            원활한 서비스 제공을 위해 아래와 같이 외부 업체에 업무를 위탁하고
            있습니다.
          </p>
          <ul className="mb-4 ml-4 list-disc space-y-1">
            <li>
              <strong>수탁자</strong>: OTP 인증 및 문자 발송 업체
            </li>
            <li>
              <strong>위탁 업무</strong>: 본인 확인을 위한 OTP 인증 및 카카오
              알림톡/문자 발송
            </li>
          </ul>

          <h3 className="mt-6 mb-2 text-base font-semibold">
            5. 이용자의 권리 및 거부권
          </h3>
          <p className="mb-4">
            이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
            다만, <strong>이름 및 휴대전화번호</strong> 수집에 동의하지 않으실
            경우, 본인 확인 기반의 스탬프 적립 및 리딤 서비스 이용이 제한됩니다.
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-kkookk-steel">
            <p>공고일자: 2026년 2월 13일</p>
            <p>시행일자: 2026년 2월 13일</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
