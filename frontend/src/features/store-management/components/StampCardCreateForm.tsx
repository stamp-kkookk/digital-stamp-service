/**
 * StampCardCreateForm 컴포넌트
 * 새 스탬프 카드 생성을 위한 3단계 마법사
 *
 * Step 1: 템플릿 선택 (기본형 / 이미지형 / v2 커스텀 8종)
 * Step 2: 디자인 커스터마이징
 * Step 3: 목표 스탬프 수 + 보상 혜택
 */

import { StampCardBackV2 } from "@/features/wallet/components/StampCardBackV2";
import { StampCardFrontV2 } from "@/features/wallet/components/StampCardFrontV2";
import type { DesignJsonV2 } from "@/features/wallet/types/designV2";
import type { CreateStampCardRequest, StampCardDesignType } from "@/types/api";
import type { StampCardDesign, V2TemplateId } from "@/types/domain";
import {
  Check,
  ChevronLeft,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTemplateById } from "../data/stampCardTemplates";
import { StampCardDesigner } from "./designer/StampCardDesigner";

interface StampCardCreateFormProps {
  storeName: string;
  onSubmit: (data: CreateStampCardRequest) => void;
  onCancel: () => void;
}

const INITIAL_DESIGN: StampCardDesign = {
  template: "basic",
  color: "orange",
  cardName: "단골 스탬프",
  maxStamps: 10,
  reward: "아메리카노 1잔",
  backgroundImage: null,
  stampImage: null,
  textColor: "black",
};

const COLOR_OPTIONS = [
  "orange",
  "indigo",
  "emerald",
  "purple",
  "rose",
] as const;

function isV2Template(template: string): template is V2TemplateId {
  return template.startsWith("v2-");
}

const CUSTOM_MOCK_PAIRS = [
  { front: "/mock/custom-stamp-foreground.png", back: "/mock/custom-stamp-background.png" },
  { front: "/mock/custom-stamp-foreground2.png", back: "/mock/custom-stamp-background2.png" },
  { front: "/mock/custom-stamp-foreground3.png", back: "/mock/custom-stamp-background3.png" },
  { front: "/mock/custom-stamp-foreground4.png", back: "/mock/custom-stamp-background4.png" },
  { front: "/mock/custom-stamp-foreground5.png", back: "/mock/custom-stamp-background5.png" },
] as const;

export function StampCardCreateForm({
  onSubmit,
  onCancel,
}: StampCardCreateFormProps) {
  const [step, setStep] = useState(1);
  const [design, setDesign] = useState<StampCardDesign>(INITIAL_DESIGN);

  // 커스텀 mock 슬라이드쇼
  const [mockIndex, setMockIndex] = useState(0);
  const [mockFading, setMockFading] = useState(false);
  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isV2 = isV2Template(design.template);

  useEffect(() => {
    if (!(isV2 && step === 1)) {
      if (mockTimerRef.current) clearInterval(mockTimerRef.current);
      mockTimerRef.current = null;
      return;
    }
    mockTimerRef.current = setInterval(() => {
      setMockFading(true);
      setTimeout(() => {
        setMockIndex((prev) => (prev + 1) % CUSTOM_MOCK_PAIRS.length);
        setMockFading(false);
      }, 400);
    }, 3000);
    return () => {
      if (mockTimerRef.current) clearInterval(mockTimerRef.current);
    };
  }, [isV2, step]);

  /** v2 선택 시 적용 중인 DesignJsonV2 (색상 커스텀 반영) */
  const activeV2Design = useMemo<DesignJsonV2 | null>(() => {
    if (!isV2Template(design.template)) return null;
    if (design.designV2) return design.designV2;
    const tpl = getTemplateById(design.template);
    return tpl?.design ?? null;
  }, [design.template, design.designV2]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "backgroundImage" | "stampImage",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = key === "backgroundImage" ? 3 * 1024 * 1024 : 500 * 1024;
    const maxSizeText = key === "backgroundImage" ? "3MB" : "500KB";

    if (file.size > maxSize) {
      alert(
        `파일 크기가 너무 큽니다.\n${maxSizeText} 이하의 이미지를 선택해주세요.`,
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDesign((prev) => ({
        ...prev,
        [key]: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectV2Template = (templateId: V2TemplateId) => {
    const tpl = getTemplateById(templateId);
    if (!tpl) return;
    setDesign({
      ...design,
      template: templateId,
      maxStamps: tpl.goalStampCount,
      cardName:
        design.cardName === INITIAL_DESIGN.cardName
          ? tpl.nameKo + " 스탬프"
          : design.cardName,
      designV2: tpl.design,
    });
  };

  const handleSubmit = () => {
    // v2 커스텀 경로: 도장 개수는 디자이너에서 설정한 슬롯 수 사용
    if (isV2Template(design.template) && activeV2Design) {
      const request: CreateStampCardRequest = {
        title: design.cardName,
        goalStampCount: activeV2Design.back.stampSlots.length,
        rewardName: design.reward,
        rewardQuantity: 1,
        expireDays: 30,
        designType: "CUSTOM" as StampCardDesignType,
        designJson: JSON.stringify(activeV2Design),
      };
      onSubmit(request);
      return;
    }

    // 기존 v1 경로 (basic / custom)
    const designType: StampCardDesignType =
      design.template === "custom" ? "IMAGE" : "COLOR";
    const designJson =
      designType === "IMAGE"
        ? JSON.stringify({
            backgroundImage: design.backgroundImage,
            stampImage: design.stampImage,
          })
        : JSON.stringify({ color: design.color });

    const request: CreateStampCardRequest = {
      title: design.cardName,
      goalStampCount: design.maxStamps,
      rewardName: design.reward,
      rewardQuantity: 1,
      expireDays: 30,
      designType,
      designJson,
    };
    onSubmit(request);
  };

  const getColorClass = (color: string, type: "bg" | "shadow" = "bg") => {
    const colorMap: Record<string, string> = {
      orange: type === "bg" ? "bg-kkookk-orange-500" : "shadow-orange-200",
      indigo: type === "bg" ? "bg-kkookk-indigo" : "shadow-blue-200",
      emerald: type === "bg" ? "bg-emerald-600" : "shadow-emerald-200",
      purple: type === "bg" ? "bg-purple-600" : "shadow-purple-200",
      rose: type === "bg" ? "bg-rose-600" : "shadow-rose-200",
    };
    return (
      colorMap[color] || (type === "bg" ? "bg-slate-600" : "shadow-slate-200")
    );
  };

  const handleDesignerChange = useCallback((updated: DesignJsonV2) => {
    setDesign((prev) => ({ ...prev, designV2: updated }));
  }, []);

  // v2 + Step 2: 에디터 전체화면 모드
  const showDesignerFullscreen = isV2 && step === 2 && activeV2Design;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {showDesignerFullscreen ? (
        /* ── v2 에디터 전체화면 ── */
        <div className="relative flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-4 p-4 bg-white border-b border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-kkookk-steel hover:text-kkookk-navy"
            >
              <ChevronLeft size={16} /> 기본 템플릿
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-3 flex-1">
              <label
                htmlFor="card-name-editor"
                className="text-sm font-bold text-kkookk-navy shrink-0"
              >
                카드 이름
              </label>
              <input
                id="card-name-editor"
                value={design.cardName}
                onChange={(e) =>
                  setDesign({ ...design, cardName: e.target.value })
                }
                className="w-60 px-3 py-1.5 text-sm border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
              />
            </div>
            <span className="text-xs text-kkookk-steel">
              도장을 드래그하여 위치를 조정하세요
            </span>
          </div>
          <div className="relative flex-1 min-h-0 p-6 pb-20 overflow-y-auto bg-kkookk-sand">
            <StampCardDesigner
              key={design.template}
              initialDesign={activeV2Design}
              onDesignChange={handleDesignerChange}
            />
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="absolute px-6 py-3 font-bold text-white rounded-lg shadow-lg bottom-6 right-6 bg-kkookk-navy hover:bg-slate-800"
            >
              다음 단계
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 overflow-hidden">
          {/* 왼쪽 패널 - 폼 */}
          <div className="w-[400px] bg-white border-r border-slate-200 px-6 py-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={onCancel}
                className="flex items-center gap-1 text-sm text-kkookk-steel hover:text-kkookk-navy"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
            </div>

            {/* 1단계: 템플릿 선택 */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-kkookk-navy">
                  템플릿 선택
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* 컬러 */}
                  <button
                    type="button"
                    onClick={() =>
                      setDesign({
                        ...design,
                        template: "basic",
                        designV2: undefined,
                      })
                    }
                    className={`p-3 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                      design.template === "basic"
                        ? "border-kkookk-indigo ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-24 gap-2 mb-2 border rounded-lg bg-slate-50 border-slate-100">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 bg-orange-500 border-2 border-white rounded-full shadow-sm" />
                        <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
                        <div className="w-6 h-6 border-2 border-white rounded-full shadow-sm bg-emerald-500" />
                        <div className="w-6 h-6 border-2 border-white rounded-full shadow-sm bg-rose-500" />
                        <div className="w-6 h-6 border-2 border-white rounded-full shadow-sm bg-violet-500" />
                      </div>
                      <div className="w-16 h-2 rounded-full bg-slate-200" />
                      <div className="w-10 h-2 rounded-full bg-slate-200" />
                    </div>
                    <p className="text-sm font-medium text-center text-kkookk-navy">
                      컬러형
                    </p>
                  </button>

                  {/* 이미지 */}
                  <button
                    type="button"
                    onClick={() =>
                      setDesign({
                        ...design,
                        template: "custom",
                        designV2: undefined,
                      })
                    }
                    className={`p-3 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                      design.template === "custom"
                        ? "border-kkookk-indigo ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="relative flex items-end justify-center h-24 mb-2 overflow-hidden border rounded-lg bg-linear-to-br from-sky-50 to-indigo-50 border-slate-200">
                      <svg
                        viewBox="0 0 120 48"
                        className="w-full h-12"
                        preserveAspectRatio="xMidYMax slice"
                      >
                        <circle
                          cx="90"
                          cy="12"
                          r="8"
                          className="fill-amber-200/60"
                        />
                        <path
                          d="M0 48 L30 20 L50 35 L70 15 L100 38 L120 28 L120 48 Z"
                          className="fill-indigo-100/80"
                        />
                        <path
                          d="M0 48 L20 32 L45 42 L65 28 L90 40 L120 35 L120 48 Z"
                          className="fill-sky-100/90"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-center text-kkookk-navy">
                      이미지형
                    </p>
                  </button>

                  {/* 직접 만들기 */}
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectV2Template("v2-blank" as V2TemplateId)
                    }
                    className={`p-3 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                      design.template === "v2-blank"
                        ? "border-kkookk-indigo ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="relative flex items-center justify-center h-24 mb-2 border rounded-lg bg-slate-50 border-slate-100 overflow-hidden">
                      <svg
                        viewBox="0 0 120 80"
                        className="w-full h-full"
                        fill="none"
                      >
                        {/* 청사진 그리드 배경 */}
                        <defs>
                          <pattern
                            id="bp-grid"
                            width="10"
                            height="10"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M10,0 L0,0 L0,10"
                              stroke="#CBD5E1"
                              strokeWidth="0.15"
                              fill="none"
                              opacity="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect width="120" height="80" fill="url(#bp-grid)" />

                        {/* 카드 프레임 (편집 대상 카드) */}
                        <rect
                          x="14"
                          y="10"
                          width="52"
                          height="32"
                          rx="4"
                          fill="white"
                          stroke="#94A3B8"
                          strokeWidth="0.4"
                          strokeDasharray="1.5 1"
                        />
                        {/* 카드 안의 텍스트 라인 */}
                        <rect
                          x="19"
                          y="15"
                          width="20"
                          height="2.5"
                          rx="1"
                          fill="#CBD5E1"
                        />
                        <rect
                          x="19"
                          y="20"
                          width="14"
                          height="2"
                          rx="1"
                          fill="#E2E8F0"
                        />
                        {/* 카드 안의 스탬프 슬롯들 */}
                        <circle
                          cx="22"
                          cy="33"
                          r="3"
                          fill="#DBEAFE"
                          stroke="#93C5FD"
                          strokeWidth="0.4"
                        />
                        <circle
                          cx="31"
                          cy="33"
                          r="3"
                          fill="#DBEAFE"
                          stroke="#93C5FD"
                          strokeWidth="0.4"
                        />
                        <circle
                          cx="40"
                          cy="33"
                          r="3"
                          fill="#E2E8F0"
                          stroke="#CBD5E1"
                          strokeWidth="0.4"
                          strokeDasharray="1 1"
                        />
                        <circle
                          cx="49"
                          cy="33"
                          r="3"
                          fill="#E2E8F0"
                          stroke="#CBD5E1"
                          strokeWidth="0.4"
                          strokeDasharray="1 1"
                        />

                        {/* 우측 속성 패널 */}
                        <rect
                          x="72"
                          y="10"
                          width="36"
                          height="46"
                          rx="3"
                          fill="white"
                          stroke="#E2E8F0"
                          strokeWidth="0.4"
                        />
                        {/* 컬러 피커 라인 */}
                        <rect
                          x="76"
                          y="14"
                          width="16"
                          height="1.5"
                          rx="0.75"
                          fill="#CBD5E1"
                        />
                        <circle cx="78" cy="20" r="2.5" fill="#F97316" />
                        <circle cx="85" cy="20" r="2.5" fill="#6366F1" />
                        <circle cx="92" cy="20" r="2.5" fill="#10B981" />
                        {/* 슬라이더 */}
                        <rect
                          x="76"
                          y="27"
                          width="16"
                          height="1.5"
                          rx="0.75"
                          fill="#CBD5E1"
                        />
                        <rect
                          x="76"
                          y="26.5"
                          width="10"
                          height="2.5"
                          rx="1"
                          fill="#818CF8"
                          opacity="0.5"
                        />
                        <circle
                          cx="86"
                          cy="27.75"
                          r="2"
                          fill="white"
                          stroke="#818CF8"
                          strokeWidth="0.5"
                        />
                        {/* 토글 */}
                        <rect
                          x="76"
                          y="34"
                          width="12"
                          height="1.5"
                          rx="0.75"
                          fill="#CBD5E1"
                        />
                        <rect
                          x="94"
                          y="33"
                          width="8"
                          height="4"
                          rx="2"
                          fill="#818CF8"
                          opacity="0.4"
                        />
                        <circle cx="100" cy="35" r="1.5" fill="white" />

                        {/* 드래그 중인 스탬프 (떠 있는 느낌) */}
                        <g transform="translate(46, 46)">
                          <circle cx="0" cy="2" r="4" fill="#00000008" />
                          <circle
                            cx="0"
                            cy="0"
                            r="4"
                            fill="#BFDBFE"
                            stroke="#3B82F6"
                            strokeWidth="0.6"
                            strokeDasharray="1.5 1"
                          />
                          <path
                            d="M0,4 C-2,10 -8,14 -6,20"
                            stroke="#3B82F6"
                            strokeWidth="0.4"
                            strokeDasharray="1 1.5"
                            opacity="0.4"
                          />
                        </g>

                        {/* 손 아이콘 */}
                        <image
                          href="/icon/hand-click.png"
                          x="42"
                          y="32"
                          width="28"
                          height="28"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-center text-kkookk-navy">
                      커스텀형
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* 2단계: 디자인 커스터마이징 */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <label
                    htmlFor="card-name"
                    className="block mb-3 text-sm font-bold text-kkookk-navy"
                  >
                    카드 이름
                  </label>
                  <input
                    id="card-name"
                    value={design.cardName}
                    onChange={(e) =>
                      setDesign({ ...design, cardName: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
                  />
                </div>

                {design.template === "basic" && (
                  <div>
                    <span className="block mb-3 text-sm font-bold text-kkookk-navy">
                      브랜드 컬러
                    </span>
                    <div className="flex gap-3">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDesign({ ...design, color: c })}
                          className={`w-8 h-8 rounded-full ring-offset-2 ${getColorClass(c)} ${
                            design.color === c ? "ring-2 ring-kkookk-navy" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {design.template === "custom" && (
                  <div className="space-y-6">
                    <div>
                      <span className="block mb-3 text-sm font-bold text-kkookk-navy">
                        카드 배경 이미지
                      </span>
                      <div className="relative p-6 text-center transition-colors border-2 border-dashed cursor-pointer border-slate-300 rounded-xl hover:bg-slate-50 group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, "backgroundImage")
                          }
                          className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center transition-colors text-kkookk-steel group-hover:text-kkookk-indigo">
                          <Upload size={24} className="mb-2" />
                          <span className="text-xs">
                            {design.backgroundImage
                              ? "이미지 변경하기"
                              : "클릭하여 업로드"}
                          </span>
                        </div>
                      </div>
                      {design.backgroundImage && (
                        <div className="relative w-full h-24 mt-2 bg-center bg-cover border rounded-lg border-slate-200">
                          <div
                            className="absolute inset-0 bg-center bg-cover rounded-lg"
                            style={{
                              backgroundImage: `url(${design.backgroundImage})`,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDesign({ ...design, backgroundImage: null })
                            }
                            className="absolute p-1 text-white rounded-full top-1 right-1 bg-black/50 hover:bg-black/70"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-kkookk-steel">
                        <p>권장 사이즈: 800x480px (5:3 비율)</p>
                        <p className="text-rose-600">파일 크기: 3MB 이하</p>
                      </div>
                    </div>

                    <div>
                      <span className="block mb-3 text-sm font-bold text-kkookk-navy">
                        도장 이미지
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-16 h-16 overflow-hidden border-2 border-dashed rounded-full cursor-pointer border-slate-300 hover:border-kkookk-indigo">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "stampImage")}
                            className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                          />
                          {design.stampImage ? (
                            <img
                              src={design.stampImage}
                              alt="Stamp"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Check size={20} className="text-kkookk-steel" />
                          )}
                        </div>
                        <div className="text-xs text-kkookk-steel">
                          <p>PNG, JPG (투명 배경 권장)</p>
                          <p>권장 사이즈: 100x100px</p>
                          <p className="text-rose-600">파일 크기: 500KB 이하</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* v2 템플릿: 다음 단계에서 에디터 안내 */}
                {isV2 && activeV2Design && (
                  <div className="p-3 border rounded-lg border-blue-100 bg-blue-50">
                    <p className="text-xs font-medium text-blue-700">
                      다음 단계에서 도장 위치를 드래그로 자유롭게 조정할 수
                      있습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3단계: 스탬프 수 및 보상 */}
            {step === 3 && (
              <div className="space-y-8">
                {/* v2는 디자이너에서 도장 수 설정하므로 숨김 */}
                {!isV2 && (
                  <div>
                    <span className="block mb-3 text-sm font-bold text-kkookk-navy">
                      목표 스탬프 수
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setDesign({
                            ...design,
                            maxStamps: Math.max(5, design.maxStamps - 1),
                          })
                        }
                        className="flex items-center justify-center w-10 h-10 border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-xl font-bold text-center text-kkookk-navy">
                        {design.maxStamps}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDesign({
                            ...design,
                            maxStamps: Math.min(20, design.maxStamps + 1),
                          })
                        }
                        className="flex items-center justify-center w-10 h-10 border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {isV2 && activeV2Design && (
                  <div className="p-3 border rounded-lg border-blue-100 bg-blue-50">
                    <p className="text-xs font-medium text-blue-700">
                      도장 수: {activeV2Design.back.stampSlots.length}개
                      (디자이너에서 설정됨)
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="reward"
                    className="block mb-3 text-sm font-bold text-kkookk-navy"
                  >
                    보상 혜택
                  </label>
                  <input
                    id="reward"
                    value={design.reward}
                    onChange={(e) =>
                      setDesign({ ...design, reward: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 패널 - 미리보기 */}
          <div className="flex items-center justify-center flex-1 min-h-0 p-6 pb-24 bg-kkookk-sand">
            <div className="w-[320px] h-150 max-h-full bg-white rounded-4xl shadow-2xl border-4 border-kkookk-navy overflow-hidden flex flex-col">
              <div className="flex flex-col overflow-y-auto">
                <div className="p-4 pt-8">
                  <h2 className="mb-4 text-lg font-bold text-kkookk-navy">
                    {design.cardName}
                  </h2>

                  {/* v2 미리보기: 앞면 + 뒷면 */}
                  {isV2 && activeV2Design ? (
                    step === 1 ? (
                      /* Step 1: mock 슬라이드쇼로 커스텀 예시 미리보기 */
                      <>
                        <h3 className="mb-2 text-sm font-bold text-kkookk-steel">
                          앞면
                        </h3>
                        <div className="relative mb-3 overflow-hidden rounded-2xl shadow-lg aspect-[1.75/1]">
                          {CUSTOM_MOCK_PAIRS.map((pair, i) => (
                            <img
                              key={pair.front}
                              src={pair.front}
                              alt={`커스텀 카드 앞면 예시 ${i + 1}`}
                              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                              style={{ opacity: i === mockIndex && !mockFading ? 1 : 0 }}
                              draggable={false}
                            />
                          ))}
                        </div>
                        <h3 className="mb-2 text-sm font-bold text-kkookk-steel">
                          뒷면
                        </h3>
                        <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-[1.75/1]">
                          {CUSTOM_MOCK_PAIRS.map((pair, i) => (
                            <img
                              key={pair.back}
                              src={pair.back}
                              alt={`커스텀 카드 뒷면 예시 ${i + 1}`}
                              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                              style={{ opacity: i === mockIndex && !mockFading ? 1 : 0 }}
                              draggable={false}
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-center text-kkookk-steel">
                          이런 카드를 직접 만들 수 있어요!
                        </p>
                      </>
                    ) : (
                      /* Step 3: 실제 디자인 미리보기 */
                      <>
                        <div className="mb-3">
                          <StampCardFrontV2 design={activeV2Design} />
                        </div>
                        <h3 className="mb-2 text-sm font-bold text-kkookk-steel">
                          스탬프 보드
                        </h3>
                        <StampCardBackV2 design={activeV2Design} stampCount={3} />
                      </>
                    )
                  ) : (
                    <>
                      {/* 기존 v1 카드 미리보기 */}
                      <div
                        className={`rounded-2xl aspect-[1.58/1] mb-6 shadow-lg relative overflow-hidden transition-all duration-300 ${
                          design.template === "basic"
                            ? `${getColorClass(design.color)} ${getColorClass(design.color, "shadow")}`
                            : design.backgroundImage
                              ? "shadow-md"
                              : "bg-slate-100 border border-slate-200 shadow-sm"
                        }`}
                        style={
                          design.template === "custom" && design.backgroundImage
                            ? {
                                backgroundImage: `url(${design.backgroundImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : {}
                        }
                      >
                        {design.template === "custom" &&
                          design.backgroundImage && (
                            <div className="absolute inset-0 bg-black/10" />
                          )}

                        {design.template === "basic" && (
                          <>
                            <div
                              className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.08]"
                              style={{
                                background:
                                  "radial-gradient(circle, white 0%, transparent 70%)",
                              }}
                            />
                            <img
                              src="/image/cat_pace.png"
                              alt=""
                              aria-hidden="true"
                              className="absolute -right-6 -bottom-6 opacity-[0.07] w-40 h-40 object-cover -rotate-12"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/[0.08] to-transparent" />
                          </>
                        )}

                        {design.template === "custom" &&
                          !design.backgroundImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
                              <ImageIcon size={40} strokeWidth={1.2} />
                              <span className="text-xs font-medium text-slate-400">
                                배경 이미지를 업로드해 주세요
                              </span>
                            </div>
                          )}
                      </div>

                      {/* v1 스탬프 보드 미리보기 */}
                      <h3 className="mb-2 text-sm font-bold text-kkookk-steel">
                        스탬프 보드
                      </h3>
                      <div
                        className={`grid grid-cols-5 gap-2 p-3 rounded-xl relative overflow-hidden transition-all ${
                          design.template === "basic"
                            ? "bg-kkookk-sand"
                            : "bg-slate-50"
                        }`}
                      >
                        {Array.from({ length: design.maxStamps }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden relative z-10 ${
                                i < 3
                                  ? design.template === "basic"
                                    ? `${getColorClass(design.color)} text-white`
                                    : design.textColor === "black"
                                      ? "bg-kkookk-navy text-white"
                                      : "bg-white border border-slate-200 text-kkookk-navy shadow-sm"
                                  : "bg-white border border-slate-200 text-slate-300"
                              }`}
                            >
                              {i < 3 ? (
                                design.template === "custom" &&
                                design.stampImage ? (
                                  <img
                                    src={design.stampImage}
                                    alt="stamp"
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <Check
                                    size={10}
                                    className={
                                      design.template === "custom" && i < 3
                                        ? design.textColor === "black"
                                          ? "text-white"
                                          : "text-kkookk-navy"
                                        : "text-white"
                                    }
                                  />
                                )
                              ) : (
                                i + 1
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 다음/게시 버튼 - 프리뷰 영역 우하단 */}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="absolute px-6 py-3 font-bold text-white rounded-lg shadow-lg bottom-6 right-6 bg-kkookk-navy hover:bg-slate-800"
            >
              다음 단계
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="absolute px-6 py-3 font-bold text-white rounded-lg shadow-lg bottom-6 right-6 bg-kkookk-indigo hover:bg-blue-700"
            >
              게시하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default StampCardCreateForm;
