import React, { useState, useRef, useEffect, useCallback } from 'react';
import Chip from './Chip';

interface BodyPartFilterProps {
  bodyParts: string[];
  onFilterChange: (removedBodyParts: string[]) => void;
  initialRemovedBodyParts?: string[];
}

export function BodyPartFilter({
  bodyParts,
  onFilterChange,
  initialRemovedBodyParts = [],
}: BodyPartFilterProps) {
  // State to track removed body parts
  const [removedBodyParts, setRemovedBodyParts] = useState<string[]>(initialRemovedBodyParts);
  
  // State to track if body parts container is overflowing
  const [isBodyPartsOverflowing, setIsBodyPartsOverflowing] = useState(false);
  
  // State to track if the body parts container is scrolled to the end
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  
  // Ref for body parts container
  const bodyPartsRef = useRef<HTMLDivElement>(null);
  
  // Ref to track current overflow state to avoid dependency loops
  const isOverflowingRef = useRef(false);

  // Call onFilterChange when removedBodyParts changes
  useEffect(() => {
    onFilterChange(removedBodyParts);
  }, [removedBodyParts, onFilterChange]);

  // Toggle body part filter
  const toggleBodyPart = (bodyPart: string) => {
    setRemovedBodyParts((prev) => 
      prev.includes(bodyPart)
        ? prev.filter((part) => part !== bodyPart)
        : [...prev, bodyPart]
    );
  };

  // Check for overflow using ResizeObserver
  const checkOverflow = useCallback(() => {
    if (bodyPartsRef.current) {
      const isOverflowing =
        bodyPartsRef.current.scrollWidth > bodyPartsRef.current.clientWidth;

      // Only update state if the overflow status has changed
      if (isOverflowing !== isOverflowingRef.current) {
        isOverflowingRef.current = isOverflowing;
        setIsBodyPartsOverflowing(isOverflowing);
      }
    }
  }, []);

  // Handle scroll events on the body parts container
  const handleBodyPartsScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
      // Check if scrolled to the end (within a small tolerance)
      const atEnd = scrollWidth - clientWidth - scrollLeft < 1;
      setIsScrolledToEnd(atEnd);
    },
    []
  );

  // Check if body parts container is overflowing
  useEffect(() => {
    checkOverflow();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    if (bodyPartsRef.current) {
      resizeObserver.observe(bodyPartsRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow]);

  // Reset filters
  const resetFilters = () => {
    setRemovedBodyParts([]);
  };

  return (
    <div className="mb-4">
      <h4 className="text-gray-50 font-medium mb-4">Target Body Parts:</h4>
      <div className="relative max-w-full overflow-hidden">
        <div
          ref={bodyPartsRef}
          className="flex overflow-x-auto hide-scrollbar pb-2 max-w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleBodyPartsScroll}
        >
          <div className="flex gap-2 min-w-min pr-8">
            {bodyParts.map((bodyPart) => (
              <Chip
                key={bodyPart}
                onClick={() => toggleBodyPart(bodyPart)}
                size="lg"
                variant={removedBodyParts.includes(bodyPart) ? 'inactive' : 'default'}
                icon={
                  removedBodyParts.includes(bodyPart) ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )
                }
              >
                {bodyPart}
              </Chip>
            ))}
          </div>
        </div>
        {isBodyPartsOverflowing && !isScrolledToEnd && (
          <div
            className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-900/90 from-30% via-gray-900/70 via-60% to-transparent pointer-events-none"
            style={{ right: '-2px' }}
          />
        )}
      </div>
      
      {removedBodyParts.length > 0 && (
        <button
          onClick={resetFilters}
          className="text-indigo-300 hover:text-indigo-200 mt-2 text-sm underline"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}

export default BodyPartFilter; 