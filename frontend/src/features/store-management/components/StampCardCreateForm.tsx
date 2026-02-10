/**
 * StampCardCreateForm 컴포넌트
 * 새 스탬프 카드 생성을 위한 3단계 마법사
 * 기존 mock/ui.old.js 구현을 기반으로 함
 */

import type { StampCardDesign } from "@/types/domain";
import type { CreateStampCardRequest, StampCardDesignType } from "@/types/api";
import {
  Check,
  ChevronLeft,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

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

export function StampCardCreateForm({
  storeName,
  onSubmit,
  onCancel,
}: StampCardCreateFormProps) {
  const [step, setStep] = useState(1);
  const [design, setDesign] = useState<StampCardDesign>(INITIAL_DESIGN);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "backgroundImage" | "stampImage",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesign((prev) => ({
          ...prev,
          [key]: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const designType: StampCardDesignType =
      design.template === "custom" ? "IMAGE" : "COLOR";

    const designJson =
      designType === "IMAGE"
        ? JSON.stringify({
            backgroundImage: design.backgroundImage,
            stampImage: design.stampImage,
          })
        : JSON.stringify({
            color: design.color,
          });

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널 - 폼 */}
        <div className="w-[400px] bg-white border-r border-slate-200 p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-sm text-kkookk-steel hover:text-kkookk-navy"
            >
              <ChevronLeft size={16} /> 목록으로
            </button>
          </div>

          {/* 1단계: 템플릿 선택 */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-kkookk-navy">
                템플릿 선택
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDesign({ ...design, template: "basic" })}
                  className={`p-4 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                    design.template === "basic"
                      ? "border-kkookk-indigo ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-24 gap-2 mb-3 border rounded-lg bg-slate-50 border-slate-100">
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
                    기본형
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDesign({ ...design, template: "custom" })}
                  className={`p-4 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                    design.template === "custom"
                      ? "border-kkookk-indigo ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-center h-24 mb-3 border rounded-lg bg-slate-100 border-slate-200 text-slate-400">
                    <ImageIcon />
                  </div>
                  <p className="text-sm font-medium text-center text-kkookk-navy">
                    이미지형 (커스텀)
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
                        onChange={(e) => handleFileUpload(e, "backgroundImage")}
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3단계: 스탬프 수 및 보상 */}
          {step === 3 && (
            <div className="space-y-8">
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
        <div className="relative flex flex-col items-center justify-center flex-1 p-8 bg-kkookk-sand">
          <div className="w-[320px] bg-white rounded-[32px] shadow-2xl border-4 border-kkookk-navy overflow-hidden h-[600px] flex flex-col">
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-4 pt-8">
                <h2 className="mb-4 text-lg font-bold text-kkookk-navy">
                  {design.cardName}
                </h2>

                {/* 카드 미리보기 */}
                <div
                  className={`rounded-2xl p-5 mb-6 shadow-lg relative overflow-hidden transition-all duration-300 ${
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
                  {design.template === "custom" && design.backgroundImage && (
                    <div className="absolute inset-0 bg-black/10" />
                  )}

                  <div
                    className={`flex justify-between items-start mb-6 relative z-10 ${
                      design.template === "custom" &&
                      design.textColor === "black"
                        ? "text-kkookk-navy"
                        : design.template === "custom" &&
                            !design.backgroundImage
                          ? "text-kkookk-navy"
                          : "text-white"
                    }`}
                  >
                    <span
                      className={`font-bold opacity-90 ${design.template === "custom" && design.backgroundImage ? "drop-shadow-md" : ""}`}
                    >
                      {storeName}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded backdrop-blur-sm shadow-sm ${
                        design.template === "custom" && !design.backgroundImage
                          ? "bg-slate-200 text-kkookk-steel"
                          : "bg-white/20"
                      }`}
                    >
                      D-30
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-end relative z-10 ${
                      design.template === "custom" &&
                      design.textColor === "black"
                        ? "text-kkookk-navy"
                        : design.template === "custom" &&
                            !design.backgroundImage
                          ? "text-kkookk-navy"
                          : "text-white"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs opacity-70 mb-1 ${design.template === "custom" && design.backgroundImage ? "drop-shadow-sm" : ""}`}
                      >
                        진행률
                      </p>
                      <p
                        className={`text-2xl font-bold ${design.template === "custom" && design.backgroundImage ? "drop-shadow-md" : ""}`}
                      >
                        3 / {design.maxStamps}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 스탬프 보드 미리보기 */}
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
                  {Array.from({ length: design.maxStamps }).map((_, i) => (
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
                        design.template === "custom" && design.stampImage ? (
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex justify-between p-4 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-3 font-bold rounded-lg text-kkookk-steel hover:bg-kkookk-sand disabled:opacity-30"
        >
          이전
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-3 font-bold text-white rounded-lg bg-kkookk-navy hover:bg-slate-800"
          >
            다음 단계
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 font-bold text-white rounded-lg bg-kkookk-indigo hover:bg-blue-700"
          >
            게시하기
          </button>
        )}
      </div>
    </div>
  );
}

export default StampCardCreateForm;
