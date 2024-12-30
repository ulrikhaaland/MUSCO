import { BottomSheetRef } from 'react-spring-bottom-sheet';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ChatMessage } from '@/app/types';

interface BottomSheetHeaderProps {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedGroup: boolean;
  sheetRef: React.RefObject<BottomSheetRef>;
  getGroupDisplayName: () => string;
  getPartDisplayName: () => string;
  resetChat: () => void;
  getSnapPoints: () => number[];
  getViewportHeight: () => number;
  setIsExpanded: (expanded: boolean) => void;
}

export function BottomSheetHeader({
  messages,
  isLoading,
  selectedGroup,
  sheetRef,
  getGroupDisplayName,
  getPartDisplayName,
  resetChat,
  getSnapPoints,
  getViewportHeight,
  setIsExpanded,
}: BottomSheetHeaderProps) {
  return (
    <div className="h-12 w-full flex justify-between items-center">
      <div className="flex flex-col items-start">
        <h3 className="text-lg font-bold text-white ">{getGroupDisplayName()}</h3>
        <h2 className="text-sm text-white">{getPartDisplayName()}</h2>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {messages.length > 0 &&
          messages.some((m) => m.role === 'assistant' && m.content) &&
          !isLoading && (
            <button
              onClick={resetChat}
              className="text-white hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Reset Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        {(selectedGroup || messages.length > 0) && (
          <div className="flex flex-col">
            {sheetRef.current && (
              <>
                <button
                  onClick={() => {
                    if (sheetRef.current) {
                      const currentHeight = sheetRef.current.height;
                      const snapPoints = getSnapPoints();

                      // Find next larger snap point
                      const nextPoint = snapPoints.find(
                        (point) => point > currentHeight + 2
                      );
                      if (nextPoint) {
                        sheetRef.current.snapTo(() => nextPoint);
                        setIsExpanded(true);
                      }
                    }
                  }}
                  disabled={(() => {
                    if (!sheetRef.current) return true;
                    const currentHeight = sheetRef.current.height;
                    const snapPoints = getSnapPoints();
                    return !snapPoints.some((point) => point > currentHeight + 2);
                  })()}
                  className="flex justify-center items-center w-8 h-8 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  aria-label="Expand"
                >
                  <ExpandLessIcon className="text-white h-6 w-6" />
                </button>
                <button
                  onClick={() => {
                    if (sheetRef.current) {
                      const currentHeight = sheetRef.current.height;
                      const snapPoints = getSnapPoints();
                      const minHeight = Math.min(getViewportHeight() * 0.15, 72);

                      // Find next smaller snap point
                      const nextPoint = [...snapPoints]
                        .reverse()
                        .find((point) => point < currentHeight - 2);
                      if (nextPoint) {
                        sheetRef.current.snapTo(() => nextPoint);
                        setIsExpanded(nextPoint > minHeight);
                      }
                    }
                  }}
                  disabled={(() => {
                    if (!sheetRef.current) return true;
                    const currentHeight = sheetRef.current.height;
                    const snapPoints = getSnapPoints();
                    return !snapPoints.some((point) => point < currentHeight - 2);
                  })()}
                  className="flex justify-center items-center w-8 h-8 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  aria-label="Minimize"
                >
                  <ExpandLessIcon className="text-white h-6 w-6 rotate-180" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 