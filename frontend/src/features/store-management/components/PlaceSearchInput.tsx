import { getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { PlaceSearchResult } from '@/types/api';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PlaceSearchInputProps {
  onSelect: (place: PlaceSearchResult) => void;
  onManualMode: () => void;
  defaultAddress?: string;
}

export function PlaceSearchInput({
  onSelect,
  onManualMode,
  defaultAddress = '',
}: PlaceSearchInputProps) {
  const [query, setQuery] = useState(defaultAddress);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const data = await getRaw<PlaceSearchResult[]>(
        API_ENDPOINTS.OWNER.PLACE_SEARCH,
        { query: searchQuery }
      );
      setResults(data);
      setShowDropdown(true);
    } catch {
      setError('검색 중 오류가 발생했습니다.');
      setResults([]);
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.length >= 2) search(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="매장명 또는 주소를 검색해주세요"
            className="w-full p-3 border border-slate-200 rounded-xl focus:border-kkookk-indigo focus:outline-none pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <Loader2 size={18} className="animate-spin text-kkookk-steel" />
            ) : (
              <Search size={18} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={onManualMode}
                className="mt-2 text-sm text-kkookk-indigo hover:underline"
              >
                직접 입력하기
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-kkookk-steel">검색 결과가 없습니다</p>
              <button
                type="button"
                onClick={onManualMode}
                className="mt-2 text-sm text-kkookk-indigo hover:underline"
              >
                직접 입력하기
              </button>
            </div>
          ) : results.length > 0 ? (
            <>
            {results.map((place) => (
              <button
                key={place.kakaoPlaceId}
                type="button"
                onClick={() => {
                  onSelect(place);
                  setQuery(place.placeName);
                  setShowDropdown(false);
                }}
                className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              >
                <p className="font-medium text-kkookk-navy">{place.placeName}</p>
                <p className="text-xs text-kkookk-steel flex items-center gap-1 mt-0.5">
                  <MapPin size={12} />
                  {place.roadAddress || place.address}
                </p>
                {place.phone && (
                  <p className="text-xs text-kkookk-steel mt-0.5">{place.phone}</p>
                )}
              </button>
            ))}
            <div className="p-3 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onManualMode}
                className="text-sm text-kkookk-indigo hover:underline"
              >
                원하는 장소가 없나요? 직접 입력하기
              </button>
            </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
