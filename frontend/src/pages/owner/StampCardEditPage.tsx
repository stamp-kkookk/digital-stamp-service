/**
 * StampCardEditPage 컴포넌트
 * 스탬프 카드 수정 페이지 (발급 여부 기준으로 수정 허용/차단)
 * - 발급 이력 없음: 생성과 동일한 3단계 마법사로 전체 수정
 * - 발급 이력 있음: 수정 불가 안내
 */

import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  Check,
  Image as ImageIcon,
  Upload,
  X,
  Lock,
} from 'lucide-react';
import { useStore } from '@/features/store-management/hooks/useStore';
import {
  useStampCard,
  useUpdateStampCard,
} from '@/features/store-management/hooks/useStampCard';
import type { UpdateStampCardRequest, StampCardDesignType } from '@/types/api';
import type { StampCardDesign, V2TemplateId } from '@/types/domain';
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { kkookkToast } from '@/components/ui/Toast';
import { parseDesignJsonV2 } from '@/features/wallet/utils/cardDesign';
import { STAMP_CARD_TEMPLATES, getTemplateById } from '@/features/store-management/data/stampCardTemplates';
import type { DesignJsonV2 } from '@/features/wallet/types/designV2';
import { StampCardBackV2 } from '@/features/wallet/components/StampCardBackV2';
import { StampCardFrontV2 } from '@/features/wallet/components/StampCardFrontV2';
import { StampCardDesigner } from '@/features/store-management/components/designer/StampCardDesigner';

const COLOR_OPTIONS = ['orange', 'indigo', 'emerald', 'purple', 'rose'] as const;

function isV2Template(template: string): template is V2TemplateId {
  return template.startsWith('v2-');
}

function getColorClass(color: string, type: 'bg' | 'shadow' = 'bg') {
  const colorMap: Record<string, string> = {
    orange: type === 'bg' ? 'bg-kkookk-orange-500' : 'shadow-orange-200',
    indigo: type === 'bg' ? 'bg-kkookk-indigo' : 'shadow-blue-200',
    emerald: type === 'bg' ? 'bg-emerald-600' : 'shadow-emerald-200',
    purple: type === 'bg' ? 'bg-purple-600' : 'shadow-purple-200',
    rose: type === 'bg' ? 'bg-rose-600' : 'shadow-rose-200',
  };
  return colorMap[color] || (type === 'bg' ? 'bg-slate-600' : 'shadow-slate-200');
}

/** 기존 카드 데이터를 StampCardDesign 형태로 변환 */
function cardToDesign(card: {
  title: string;
  goalStampCount: number;
  rewardName: string | null;
  designType: StampCardDesignType;
  designJson: string | null;
}): StampCardDesign {
  let color = 'orange';
  let backgroundImage: string | null = null;
  let stampImage: string | null = null;
  let designV2: DesignJsonV2 | undefined;

  // CUSTOM v2: parse designJson and find matching template
  if (card.designType === 'CUSTOM' && card.designJson) {
    const v2 = parseDesignJsonV2(card.designJson);
    if (v2) {
      designV2 = v2;
      // Try to find matching template ID
      const matchingTemplate = STAMP_CARD_TEMPLATES.find(
        (tpl) => JSON.stringify(tpl.design.front.background) === JSON.stringify(v2.front.background),
      );
      return {
        template: (matchingTemplate?.id as StampCardDesign['template']) ?? 'v2-blank',
        color: 'orange',
        cardName: card.title,
        maxStamps: card.goalStampCount,
        reward: card.rewardName || '',
        backgroundImage: null,
        stampImage: null,
        textColor: 'black',
        designV2,
      };
    }
  }

  if (card.designJson) {
    try {
      const parsed = JSON.parse(card.designJson);
      if (card.designType === 'COLOR') {
        color = parsed.color || 'orange';
      } else if (card.designType === 'IMAGE') {
        backgroundImage = parsed.backgroundImage || null;
        stampImage = parsed.stampImage || null;
      }
    } catch {
      // invalid JSON - use defaults
    }
  }

  return {
    template: card.designType === 'IMAGE' ? 'custom' : 'basic',
    color,
    cardName: card.title,
    maxStamps: card.goalStampCount,
    reward: card.rewardName || '',
    backgroundImage,
    stampImage,
    textColor: 'black',
  };
}

export function StampCardEditPage() {
  const navigate = useNavigate();
  const { storeId, cardId } = useParams<{ storeId: string; cardId: string }>();
  const storeIdNum = Number(storeId);
  const cardIdNum = Number(cardId);

  const { data: store } = useStore(storeIdNum);
  const { data: card, isLoading, error } = useStampCard(storeIdNum, cardIdNum);
  const updateStampCard = useUpdateStampCard();

  const [step, setStep] = useState(1);
  const initialDesign = useMemo(() => (card ? cardToDesign(card) : null), [card]);
  const [design, setDesign] = useState<StampCardDesign | null>(null);
  const activeDesign = design ?? initialDesign;

  const goBack = () => navigate(`/owner/stores/${storeId}`);

  /** v2 선택 시 적용 중인 DesignJsonV2 */
  const activeV2Design = useMemo<DesignJsonV2 | null>(() => {
    const d = design ?? initialDesign;
    if (!d || !isV2Template(d.template)) return null;
    if (d.designV2) return d.designV2;
    const tpl = getTemplateById(d.template);
    return tpl?.design ?? null;
  }, [design, initialDesign]);

  const handleDesignerChange = useCallback(
    (updated: DesignJsonV2) => {
      setDesign((prev) => {
        const base = prev ?? initialDesign;
        if (!base) return prev;
        return { ...base, designV2: updated };
      });
    },
    [initialDesign],
  );

  const handleSelectV2Template = (templateId: V2TemplateId) => {
    const tpl = getTemplateById(templateId);
    if (!tpl) return;
    const base = design ?? initialDesign;
    if (!base) return;
    setDesign({
      ...base,
      template: templateId,
      maxStamps: tpl.goalStampCount,
      cardName: base.cardName,
      designV2: tpl.design,
    });
  };

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">카드 정보를 불러오는 중...</p>
      </div>
    );
  }

  // --- Not Found ---
  if (error || !card) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">스탬프 카드를 찾을 수 없습니다.</p>
        <button
          onClick={goBack}
          className="px-4 py-2 mt-4 font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
        >
          매장으로 돌아가기
        </button>
      </div>
    );
  }

  // --- Non-editable (issued) ---
  if (card.issued) {
    return (
      <div className="w-full max-w-2xl p-8 mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-1 mb-6 text-sm text-kkookk-steel hover:text-kkookk-navy"
        >
          <ChevronLeft size={16} /> 매장으로 돌아가기
        </button>

        <div className="p-8 text-center border rounded-2xl border-slate-200 bg-slate-50">
          <Lock className="w-12 h-12 mx-auto mb-4 text-kkookk-steel" />
          <h2 className="mb-2 text-xl font-bold text-kkookk-navy">
            수정할 수 없습니다
          </h2>
          <p className="mb-6 text-sm text-kkookk-steel">
            이미 고객에게 발급된 카드는 수정할 수 없습니다.
          </p>
          <Button variant="outline" onClick={goBack}>
            매장으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // --- Editable: 3-step wizard (same as creation form) ---
  if (!activeDesign) return null;

  // Local alias for the current design (either user-modified or initial)
  const d = activeDesign;

  const updateDesign = (patch: Partial<StampCardDesign>) => {
    setDesign({ ...d, ...patch });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'backgroundImage' | 'stampImage',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = key === 'backgroundImage' ? 3 * 1024 * 1024 : 500 * 1024;
    const maxSizeText = key === 'backgroundImage' ? '3MB' : '500KB';

    if (file.size > maxSize) {
      kkookkToast.error(`파일 크기가 너무 큽니다`, {
        description: `${maxSizeText} 이하의 이미지를 선택해주세요.`,
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateDesign({ [key]: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    let designType: StampCardDesignType;
    let designJson: string;

    if (d.template.startsWith('v2-') && d.designV2) {
      designType = 'CUSTOM';
      designJson = JSON.stringify(d.designV2);
    } else if (d.template === 'custom') {
      designType = 'IMAGE';
      designJson = JSON.stringify({
        backgroundImage: d.backgroundImage,
        stampImage: d.stampImage,
      });
    } else {
      designType = 'COLOR';
      designJson = JSON.stringify({ color: d.color });
    }

    const data: UpdateStampCardRequest = {
      title: d.cardName,
      goalStampCount: d.maxStamps,
      rewardName: d.reward,
      rewardQuantity: 1,
      expireDays: card.expireDays ?? 30,
      designType,
      designJson,
    };

    updateStampCard.mutate(
      { storeId: storeIdNum, stampCardId: cardIdNum, data },
      {
        onSuccess: () => {
          kkookkToast.success('스탬프 카드가 수정되었습니다');
          goBack();
        },
        onError: (err) => {
          kkookkToast.error('스탬프 카드 수정 실패', { description: err.message });
        },
      },
    );
  };

  const isV2 = isV2Template(d.template);
  const showDesignerFullscreen = isV2 && step === 2 && activeV2Design;

  return (
    <div className="flex flex-col h-full">
      {showDesignerFullscreen ? (
        /* ── v2 에디터 전체화면 ── */
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-4 p-4 bg-white border-b border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-kkookk-steel hover:text-kkookk-navy"
            >
              <ChevronLeft size={16} /> 템플릿 선택
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-3 flex-1">
              <label htmlFor="card-name-editor" className="text-sm font-bold text-kkookk-navy shrink-0">
                카드 이름
              </label>
              <input
                id="card-name-editor"
                value={d.cardName}
                onChange={(e) => updateDesign({ cardName: e.target.value })}
                className="w-60 px-3 py-1.5 text-sm border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
              />
            </div>
            <span className="text-xs text-kkookk-steel">
              도장을 드래그하여 위치를 조정하세요
            </span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-kkookk-sand">
            <StampCardDesigner
              key={d.template}
              initialDesign={activeV2Design}
              onDesignChange={handleDesignerChange}
            />
          </div>
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Form */}
        <div className="w-[400px] bg-white border-r border-slate-200 p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-kkookk-steel hover:text-kkookk-navy"
            >
              <ChevronLeft size={16} /> 목록으로
            </button>
            <span className="text-xs text-kkookk-steel">
              {store?.name} · 카드 수정
            </span>
          </div>

          {/* Step 1: Template */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-kkookk-navy">템플릿 선택</h3>

              {/* 기존 2종: 기본형 + 이미지형 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateDesign({ template: 'basic', designV2: undefined })}
                  className={`p-4 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                    d.template === 'basic'
                      ? 'border-kkookk-indigo ring-2 ring-blue-100'
                      : 'border-slate-200'
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
                  <p className="text-sm font-medium text-center text-kkookk-navy">기본형</p>
                </button>

                <button
                  type="button"
                  onClick={() => updateDesign({ template: 'custom', designV2: undefined })}
                  className={`p-4 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                    d.template === 'custom'
                      ? 'border-kkookk-indigo ring-2 ring-blue-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="relative flex items-end justify-center h-24 mb-3 overflow-hidden border rounded-lg bg-linear-to-br from-sky-50 to-indigo-50 border-slate-200">
                    <svg viewBox="0 0 120 48" className="w-full h-12" preserveAspectRatio="xMidYMax slice">
                      <circle cx="90" cy="12" r="8" className="fill-amber-200/60" />
                      <path d="M0 48 L30 20 L50 35 L70 15 L100 38 L120 28 L120 48 Z" className="fill-indigo-100/80" />
                      <path d="M0 48 L20 32 L45 42 L65 28 L90 40 L120 35 L120 48 Z" className="fill-sky-100/90" />
                    </svg>
                    <div className="absolute top-2 right-2">
                      <ImageIcon size={14} className="text-indigo-300" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-center text-kkookk-navy">
                    이미지형 (커스텀)
                  </p>
                </button>
              </div>

              {/* v2 커스텀 템플릿 갤러리 */}
              <div>
                <h4 className="mb-3 text-sm font-bold text-kkookk-navy">디자인 템플릿</h4>
                <div className="grid grid-cols-2 gap-3">
                  {STAMP_CARD_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectV2Template(tpl.id as V2TemplateId)}
                      className={`p-3 border rounded-xl cursor-pointer hover:border-kkookk-indigo transition-colors text-left ${
                        d.template === tpl.id
                          ? 'border-kkookk-indigo ring-2 ring-blue-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="mb-2 overflow-hidden rounded-lg aspect-[1.58/1]">
                        <StampCardBackV2
                          design={tpl.design}
                          stampCount={3}
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-xs font-medium text-center text-kkookk-navy">
                        {tpl.nameKo}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Design */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <label htmlFor="card-name" className="block mb-3 text-sm font-bold text-kkookk-navy">
                  카드 이름
                </label>
                <input
                  id="card-name"
                  value={d.cardName}
                  onChange={(e) => updateDesign({ cardName: e.target.value })}
                  className="w-full p-3 border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
                />
              </div>

              {d.template === 'basic' && (
                <div>
                  <span className="block mb-3 text-sm font-bold text-kkookk-navy">브랜드 컬러</span>
                  <div className="flex gap-3">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateDesign({ color: c })}
                        className={`w-8 h-8 rounded-full ring-offset-2 ${getColorClass(c)} ${
                          d.color === c ? 'ring-2 ring-kkookk-navy' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {d.template === 'custom' && (
                <div className="space-y-6">
                  <div>
                    <span className="block mb-3 text-sm font-bold text-kkookk-navy">
                      카드 배경 이미지
                    </span>
                    <div className="relative p-6 text-center transition-colors border-2 border-dashed cursor-pointer border-slate-300 rounded-xl hover:bg-slate-50 group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                        className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center transition-colors text-kkookk-steel group-hover:text-kkookk-indigo">
                        <Upload size={24} className="mb-2" />
                        <span className="text-xs">
                          {d.backgroundImage ? '이미지 변경하기' : '클릭하여 업로드'}
                        </span>
                      </div>
                    </div>
                    {d.backgroundImage && (
                      <div className="relative w-full h-24 mt-2 bg-center bg-cover border rounded-lg border-slate-200">
                        <div
                          className="absolute inset-0 bg-center bg-cover rounded-lg"
                          style={{ backgroundImage: `url(${d.backgroundImage})` }}
                        />
                        <button
                          type="button"
                          onClick={() => updateDesign({ backgroundImage: null })}
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
                    <span className="block mb-3 text-sm font-bold text-kkookk-navy">도장 이미지</span>
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-16 h-16 overflow-hidden border-2 border-dashed rounded-full cursor-pointer border-slate-300 hover:border-kkookk-indigo">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'stampImage')}
                          className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                        />
                        {d.stampImage ? (
                          <img src={d.stampImage} alt="Stamp" className="object-cover w-full h-full" />
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
            </div>
          )}

          {/* Step 3: Stamp count & reward */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <span className="block mb-3 text-sm font-bold text-kkookk-navy">목표 스탬프 수</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      updateDesign({ maxStamps: Math.max(5, d.maxStamps - 1) })
                    }
                    className="flex items-center justify-center w-10 h-10 border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-xl font-bold text-center text-kkookk-navy">
                    {d.maxStamps}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateDesign({ maxStamps: Math.min(20, d.maxStamps + 1) })
                    }
                    className="flex items-center justify-center w-10 h-10 border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reward" className="block mb-3 text-sm font-bold text-kkookk-navy">
                  보상 혜택
                </label>
                <input
                  id="reward"
                  value={d.reward}
                  onChange={(e) => updateDesign({ reward: e.target.value })}
                  className="w-full p-3 border rounded-lg border-slate-200 focus:border-kkookk-indigo focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right panel - Preview */}
        <div className="relative flex flex-col items-center justify-center flex-1 p-8 bg-kkookk-sand">
          <div className="w-[320px] bg-white rounded-[32px] shadow-2xl border-4 border-kkookk-navy overflow-hidden h-[600px] flex flex-col">
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-4 pt-8">
                <h2 className="mb-4 text-lg font-bold text-kkookk-navy">
                  {d.cardName}
                </h2>

                {/* Card preview — v2 or v1 */}
                {isV2 && activeV2Design ? (
                  <>
                    <div className="mb-4 overflow-hidden rounded-2xl aspect-[1.58/1] shadow-lg">
                      <StampCardFrontV2 design={activeV2Design} className="w-full h-full" />
                    </div>
                    <h3 className="mb-2 text-sm font-bold text-kkookk-steel">스탬프 보드</h3>
                    <div className="overflow-hidden rounded-xl">
                      <StampCardBackV2
                        design={activeV2Design}
                        stampCount={3}
                        className="w-full"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`rounded-2xl aspect-[1.58/1] mb-6 shadow-lg relative overflow-hidden transition-all duration-300 ${
                        d.template === 'basic'
                          ? `${getColorClass(d.color)} ${getColorClass(d.color, 'shadow')}`
                          : d.backgroundImage
                            ? 'shadow-md'
                            : 'bg-slate-100 border border-slate-200 shadow-sm'
                      }`}
                      style={
                        d.template === 'custom' && d.backgroundImage
                          ? {
                              backgroundImage: `url(${d.backgroundImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : {}
                      }
                    >
                      {d.template === 'custom' && d.backgroundImage && (
                        <div className="absolute inset-0 bg-black/10" />
                      )}

                      {d.template === 'basic' && (
                        <>
                          <div
                            className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.08]"
                            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
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

                      {d.template === 'custom' && !d.backgroundImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
                          <ImageIcon size={40} strokeWidth={1.2} />
                          <span className="text-xs font-medium text-slate-400">
                            배경 이미지를 업로드해 주세요
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stamp board preview */}
                    <h3 className="mb-2 text-sm font-bold text-kkookk-steel">스탬프 보드</h3>
                    <div
                      className={`grid grid-cols-5 gap-2 p-3 rounded-xl relative overflow-hidden transition-all ${
                        d.template === 'basic' ? 'bg-kkookk-sand' : 'bg-slate-50'
                      }`}
                    >
                      {Array.from({ length: d.maxStamps }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden relative z-10 ${
                            i < 3
                              ? d.template === 'basic'
                                ? `${getColorClass(d.color)} text-white`
                                : d.textColor === 'black'
                                  ? 'bg-kkookk-navy text-white'
                                  : 'bg-white border border-slate-200 text-kkookk-navy shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-300'
                          }`}
                        >
                          {i < 3 ? (
                            d.template === 'custom' && d.stampImage ? (
                              <img src={d.stampImage} alt="stamp" className="object-cover w-full h-full" />
                            ) : (
                              <Check
                                size={10}
                                className={
                                  d.template === 'custom' && i < 3
                                    ? d.textColor === 'black'
                                      ? 'text-white'
                                      : 'text-kkookk-navy'
                                    : 'text-white'
                                }
                              />
                            )
                          ) : (
                            i + 1
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Bottom navigation */}
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
            disabled={updateStampCard.isPending || !d.cardName}
            className="px-6 py-3 font-bold text-white rounded-lg bg-kkookk-indigo hover:bg-blue-700 disabled:opacity-50"
          >
            {updateStampCard.isPending ? '저장 중...' : '수정 완료'}
          </button>
        )}
      </div>
    </div>
  );
}

export default StampCardEditPage;
