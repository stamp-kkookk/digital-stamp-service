/**
 * StoreDetailPage 컴포넌트
 * 매장 상세 페이지 (탭: 카드 / 히스토리 / 전환신청)
 */

import {
  useDeleteStampCard,
  useStampCard,
  useStampCards,
  useUpdateStampCardStatus,
} from "@/features/store-management/hooks/useStampCard";
import { useStore, useDeleteStore } from "@/features/store-management/hooks/useStore";
import type { StampCardDesignType, StampCardStatus } from "@/types/api";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  Coffee,
  Edit,
  Loader2,
  MapPin,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  CheckCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { kkookkToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";

type TabType = "cards" | "history" | "migrations";

interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  variant: "default" | "destructive";
  onConfirm: () => void;
}

interface DesignData {
  color?: string;
  backgroundImage?: string | null;
  stampImage?: string | null;
}

function parseDesignJson(designJson: string | null): DesignData {
  if (!designJson) return {};
  try {
    return JSON.parse(designJson);
  } catch {
    return {};
  }
}

/** 기본형 5색: rose, emerald, orange, indigo, purple */
const COLOR_GRADIENT_MAP: Record<string, [string, string]> = {
  rose: ["#f43f5e", "#e11d48"],
  emerald: ["#10b981", "#059669"],
  orange: ["#f97316", "#ea580c"],
  indigo: ["#6366f1", "#4f46e5"],
  purple: ["#a855f7", "#7c3aed"],
};

function ActiveCardPreview({
  storeName,
  designType,
  designJson,
  designLoading,
  expireDays,
  goalStampCount,
}: {
  storeName: string;
  designType: StampCardDesignType;
  designJson: string | null;
  designLoading: boolean;
  expireDays: number | null;
  goalStampCount: number;
}) {
  // 디자인 정보 로딩 중
  if (designLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center h-48 overflow-hidden shadow-lg w-80 rounded-xl shrink-0 bg-slate-200 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <p className="mt-2 text-xs text-slate-400">디자인 로딩 중...</p>
      </div>
    );
  }

  const design = parseDesignJson(designJson);
  const isImage = designType === "IMAGE";
  const hasBackgroundImage = isImage && design.backgroundImage;

  let bgStyle: React.CSSProperties;
  if (hasBackgroundImage) {
    bgStyle = {
      backgroundImage: `url(${design.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else if (!isImage && design.color) {
    const [from, to] = COLOR_GRADIENT_MAP[design.color] ?? COLOR_GRADIENT_MAP.indigo;
    bgStyle = { background: `linear-gradient(to bottom right, ${from}, ${to})` };
  } else {
    // IMAGE 타입이지만 이미지 없음 → 회색 배경
    bgStyle = { background: "linear-gradient(to bottom right, #94a3b8, #64748b)" };
  }

  return (
    <div
      className="relative flex flex-col h-48 p-6 overflow-hidden text-white shadow-lg w-80 rounded-xl shrink-0"
      style={bgStyle}
    >
      {hasBackgroundImage && (
        <div className="absolute inset-0 bg-black/30 rounded-xl" />
      )}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <span className="text-lg font-bold opacity-90">{storeName}</span>
        <span className="px-2 py-1 text-xs rounded bg-white/20">
          {expireDays ? `D-${expireDays}` : "무기한"}
        </span>
      </div>
      <div className="relative z-10 flex items-end justify-between mt-auto">
        <div>
          <p className="mb-1 text-xs opacity-80">목표</p>
          <p className="text-2xl font-bold">0 / {goalStampCount}</p>
        </div>
        <Coffee className="absolute w-16 h-16 text-white/20 -right-4 -bottom-4" />
      </div>
    </div>
  );
}

export function StoreDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId: string }>();
  const [storeDetailTab, setStoreDetailTab] = useState<TabType>("cards");
  const locationMessage = (location.state as { message?: string } | null)?.message ?? null;
  const [successMessage, setSuccessMessage] = useState<string | null>(locationMessage);

  const storeIdNum = Number(storeId);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    description: "",
    variant: "default",
    onConfirm: () => {},
  });

  const openConfirm = (opts: Omit<ConfirmDialogState, "open">) =>
    setConfirmDialog({ ...opts, open: true });
  const closeConfirm = () =>
    setConfirmDialog((prev) => ({ ...prev, open: false }));

  // API Hooks
  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useStore(storeIdNum);
  const { data: stampCardsData, isLoading: cardsLoading } = useStampCards({
    storeId: storeIdNum,
  });
  const deleteStampCard = useDeleteStampCard();
  const updateStatus = useUpdateStampCardStatus();
  const deleteStore = useDeleteStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 성공 메시지 자동 숨김 + history state 정리
  useEffect(() => {
    if (!successMessage) return;
    window.history.replaceState({}, "");
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const stampCards = stampCardsData?.content ?? [];
  const activeCard = stampCards.find((c) => c.status === "ACTIVE");

  // Fetch active card detail to get designJson
  const { data: activeCardDetail, isLoading: activeCardDetailLoading } = useStampCard(
    storeIdNum,
    activeCard?.id,
  );

  // Loading state
  if (storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
        <p className="mt-4 text-kkookk-steel">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  // Error or not found state
  if (storeError || !store) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <p className="mt-4 text-kkookk-steel">매장을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/owner/stores")}
          className="px-4 py-2 mt-4 font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
        >
          매장 목록으로
        </button>
      </div>
    );
  }

  const archivedCards = stampCards.filter((c) => c.status !== "ACTIVE");

  const handleTabClick = (tab: TabType) => {
    if (tab === "history") {
      navigate(`/owner/stores/${storeId}/history`);
    } else if (tab === "migrations") {
      navigate(`/owner/stores/${storeId}/migrations`);
    } else {
      setStoreDetailTab(tab);
    }
  };

  const getStatusBadge = (status: StampCardStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="px-2 py-1 text-xs font-bold rounded bg-slate-100 text-slate-500">
            작성 중
          </span>
        );
      case "PAUSED":
        return (
          <span className="px-2 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded">
            일시정지
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-2 py-1 text-xs font-bold text-red-500 bg-red-100 rounded">
            보관됨
          </span>
        );
      case "ACTIVE":
        return (
          <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded">
            게시 중
          </span>
        );
      default:
        return null;
    }
  };

  const handleDeleteCard = (stampCardId: number) => {
    openConfirm({
      title: "스탬프 카드 삭제",
      description: "정말로 이 스탬프 카드를 삭제하시겠습니까?",
      variant: "destructive",
      onConfirm: () => {
        closeConfirm();
        deleteStampCard.mutate(
          { storeId: storeIdNum, stampCardId },
          {
            onSuccess: () => {
              kkookkToast.success("스탬프 카드가 삭제되었습니다");
            },
            onError: (err) => {
              kkookkToast.error("삭제 실패", { description: err.message });
            },
          }
        );
      },
    });
  };

  const handleStatusChange = (stampCardId: number, status: StampCardStatus) => {
    const labels: Record<string, string> = {
      ACTIVE: "게시",
      PAUSED: "일시정지",
      ARCHIVED: "보관",
      DRAFT: "초안으로 변경",
    };

    openConfirm({
      title: "상태 변경",
      description: `이 스탬프 카드를 "${labels[status]}" 상태로 변경하시겠습니까?`,
      variant: "default",
      onConfirm: async () => {
        closeConfirm();
        try {
          await updateStatus.mutateAsync({ storeId: storeIdNum, stampCardId, status });
          kkookkToast.success(`스탬프 카드가 "${labels[status]}" 상태로 변경되었습니다`);
        } catch (err) {
          if (
            status === "ACTIVE" &&
            isAxiosError(err) &&
            err.response?.status === 409 &&
            activeCard
          ) {
            openConfirm({
              title: "활성 카드 교체",
              description: `현재 활성화된 "${activeCard.title}" 카드를 비활성화하고\n이 카드를 게시하시겠습니까?`,
              variant: "default",
              onConfirm: async () => {
                closeConfirm();
                try {
                  await updateStatus.mutateAsync({
                    storeId: storeIdNum,
                    stampCardId: activeCard.id,
                    status: "PAUSED",
                  });
                  await updateStatus.mutateAsync({
                    storeId: storeIdNum,
                    stampCardId,
                    status: "ACTIVE",
                  });
                  kkookkToast.success("활성 카드가 교체되었습니다");
                } catch (retryErr) {
                  kkookkToast.error("상태 변경 실패", {
                    description:
                      retryErr instanceof Error ? retryErr.message : "알 수 없는 오류",
                  });
                }
              },
            });
          } else {
            kkookkToast.error("상태 변경 실패", {
              description: err instanceof Error ? err.message : "알 수 없는 오류",
            });
          }
        }
      },
    });
  };

  const handleEditCard = (stampCardId: number) => {
    navigate(`/owner/stores/${storeId}/stamp-cards/${stampCardId}/edit`);
  };

  const handleDeleteStore = () => {
    deleteStore.mutate(storeIdNum, {
      onSuccess: () => {
        navigate("/owner/stores", {
          state: { message: "매장이 삭제되었습니다." },
        });
      },
      onError: () => {
        setShowDeleteConfirm(false);
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 성공 메시지 토스트 */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3 shadow-lg">
          <CheckCircle size={18} className="shrink-0 text-green-600" />
          <span className="text-sm font-medium text-green-800">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="shrink-0 text-green-400 hover:text-green-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {/* 헤더 */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/owner/stores")}
              className="p-2 -ml-2 transition-colors rounded-full text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-50"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-kkookk-navy">
                  {store.name}
                </h2>
                {!store.placeRef && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                    장소 미연동
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1 text-sm text-kkookk-steel">
                <MapPin size={12} /> {store.address || "주소 미등록"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store.status !== "SUSPENDED" && store.status !== "DELETED" && (
              <button
                onClick={() => navigate(`/owner/stores/${storeId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50 transition-colors"
              >
                <Pencil size={16} /> 매장 정보 수정
              </button>
            )}
            {store.status !== "DELETED" && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} /> 삭제
              </button>
            )}
          </div>
        </div>

        {/* Store Status Banner */}
        {store.status === "DRAFT" && (
          <div className="flex items-center gap-3 px-4 py-3 mb-4 text-sm border rounded-lg bg-gray-50 border-gray-200 text-gray-700">
            <AlertCircle size={18} />
            <div>
              <p className="font-bold">승인 대기 중</p>
              <p className="text-xs text-gray-500">운영팀에 문의하여 매장 승인을 요청하세요.</p>
            </div>
          </div>
        )}
        {store.status === "SUSPENDED" && (
          <div className="flex items-center gap-3 px-4 py-3 mb-4 text-sm border rounded-lg bg-red-50 border-red-200 text-red-700">
            <AlertCircle size={18} />
            <p className="font-bold">관리자에 의해 정지된 매장입니다</p>
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-1">
          <button
            onClick={() => handleTabClick("cards")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              storeDetailTab === "cards"
                ? "bg-kkookk-navy text-white"
                : "text-kkookk-steel hover:bg-slate-50"
            }`}
          >
            스탬프 카드 관리
          </button>
          <button
            onClick={() => handleTabClick("history")}
            className="px-4 py-2 text-sm font-bold transition-colors rounded-lg text-kkookk-steel hover:bg-slate-50"
          >
            적립/사용 내역
          </button>
          <button
            onClick={() => handleTabClick("migrations")}
            className="px-4 py-2 text-sm font-bold transition-colors rounded-lg text-kkookk-steel hover:bg-slate-50"
          >
            전환 신청 관리
          </button>
        </div>
      </div>

      {/* 카드 관리 탭 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {storeDetailTab === "cards" && (
          <>
            {cardsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-kkookk-indigo" />
              </div>
            ) : (
              <div className="w-full max-w-6xl p-8 mx-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-kkookk-navy">
                      보유 스탬프 카드
                    </h3>
                    <p className="mt-1 text-sm text-kkookk-steel">
                      고객에게 발급할 적립 카드를 관리합니다.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/owner/stores/${storeId}/stamp-cards/new`)
                    }
                    className="flex items-center gap-2 px-6 py-3 font-bold text-white transition-colors bg-kkookk-navy rounded-xl hover:bg-slate-800"
                  >
                    <Plus size={20} /> 새 스탬프 카드 만들기
                  </button>
                </div>

                {/* 현재 진행 중 (Active) */}
                <div className="mb-10">
                  <h4 className="flex items-center gap-2 mb-4 font-bold text-kkookk-navy">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    현재 진행 중 (Active)
                  </h4>
                  {activeCard ? (
                    <div className="flex items-center gap-8 p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md">
                      {/* 카드 미리보기 */}
                      <ActiveCardPreview
                        storeName={store.name}
                        designType={activeCard.designType}
                        designJson={activeCardDetail?.designJson ?? null}
                        designLoading={activeCardDetailLoading}
                        expireDays={activeCard.expireDays}
                        goalStampCount={activeCard.goalStampCount}
                      />

                      {/* 카드 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-kkookk-navy">
                            {activeCard.title}
                          </h4>
                          <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded">
                            게시 중
                          </span>
                        </div>
                        <p className="mb-6 text-sm text-kkookk-steel">
                          {activeCard.goalStampCount}개 적립 시{" "}
                          {activeCard.rewardName || "리워드 제공"}
                        </p>
                        <div className="flex gap-8 text-sm">
                          <div>
                            <p className="mb-1 text-kkookk-steel">
                              목표 스탬프
                            </p>
                            <p className="text-lg font-bold text-kkookk-navy">
                              {activeCard.goalStampCount}개
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-kkookk-steel">
                              리워드 수량
                            </p>
                            <p className="text-lg font-bold text-kkookk-navy">
                              {activeCard.rewardQuantity ?? 1}개
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditCard(activeCard.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
                        >
                          <Edit size={16} /> 수정
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/owner/stores/${storeId}/stamp-cards/${activeCard.id}/stats`,
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-lg border-slate-200 text-kkookk-navy hover:bg-slate-50"
                        >
                          <BarChart3 size={16} /> 통계
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(activeCard.id, "PAUSED")
                          }
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-50"
                        >
                          <Pause size={16} /> 일시정지
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white border rounded-2xl border-slate-200">
                      <p className="text-kkookk-steel">
                        활성화된 스탬프 카드가 없습니다.
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/owner/stores/${storeId}/stamp-cards/new`)
                        }
                        className="px-4 py-2 mt-4 font-bold text-white rounded-lg bg-kkookk-navy hover:bg-slate-800"
                      >
                        새 스탬프 카드 만들기
                      </button>
                    </div>
                  )}
                </div>

                {/* 보관함 / 초안 */}
                <div>
                  <h4 className="mb-4 font-bold text-kkookk-steel">
                    보관함 / 초안
                  </h4>
                  <div className="overflow-hidden bg-white border rounded-2xl border-slate-200">
                    <table className="w-full text-left">
                      <thead className="border-b bg-slate-50 border-slate-200">
                        <tr>
                          <th className="p-4 pl-6 text-xs font-bold text-kkookk-steel">
                            상태
                          </th>
                          <th className="p-4 text-xs font-bold text-kkookk-steel">
                            카드명
                          </th>
                          <th className="p-4 text-xs font-bold text-kkookk-steel">
                            혜택
                          </th>
                          <th className="p-4 text-xs font-bold text-kkookk-steel">
                            생성일
                          </th>
                          <th className="p-4 pr-6 text-xs font-bold text-right text-kkookk-steel">
                            관리
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {archivedCards.map((card) => (
                          <tr
                            key={card.id}
                            className="transition-colors hover:bg-slate-50 group"
                          >
                            <td className="p-4 pl-6">
                              {getStatusBadge(card.status)}
                            </td>
                            <td className="p-4 text-sm font-bold text-kkookk-navy">
                              {card.title}
                            </td>
                            <td className="p-4 text-sm text-kkookk-steel">
                              {card.goalStampCount}개 적립 시{" "}
                              {card.rewardName || "리워드"}
                            </td>
                            <td className="p-4 font-mono text-sm text-kkookk-steel">
                              {new Date(card.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-2 transition-opacity opacity-50 group-hover:opacity-100">
                                {(card.status === "DRAFT" || card.status === "PAUSED") && (
                                  <button
                                    onClick={() =>
                                      handleStatusChange(card.id, "ACTIVE")
                                    }
                                    className="p-2 text-green-600 rounded-lg hover:bg-green-50"
                                    title="게시하기"
                                  >
                                    <Play size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditCard(card.id)}
                                  className="p-2 rounded-lg text-kkookk-steel hover:text-kkookk-navy hover:bg-slate-200"
                                  title="수정"
                                >
                                  <Edit size={16} />
                                </button>
                                {card.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="p-2 rounded-lg text-kkookk-steel hover:text-red-600 hover:bg-red-50"
                                    title="삭제"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {archivedCards.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-12 text-center text-kkookk-steel"
                            >
                              보관함에 카드가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 확인 다이얼로그 (상태 변경, 카드 삭제 등) */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent showClose={false} className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm}>
              취소
            </Button>
            <Button
              variant={confirmDialog.variant === "destructive" ? "destructive" : "primary"}
              onClick={confirmDialog.onConfirm}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 매장 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <h3 className="font-bold text-kkookk-navy">
                  매장을 삭제하시겠습니까?
                </h3>
                <p className="mt-1.5 text-sm text-kkookk-steel">
                  삭제된 매장은 복구할 수 없으며, 관련 스탬프 카드도 더 이상 운영되지 않습니다.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteStore.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-kkookk-steel hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteStore}
                disabled={deleteStore.isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteStore.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleteStore.isPending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreDetailPage;
