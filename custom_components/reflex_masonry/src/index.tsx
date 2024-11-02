// File: MasonryLayout.tsx
import React, { useEffect, useRef, useState, ReactNode } from 'react';

type MasonryLayoutProps = {
  children: ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

type ItemRef = HTMLDivElement | null;

const MasonryLayout = (props: MasonryLayoutProps) => {
  const {
    children,
    columns = 3,
    gap = 4,
    className = '',
  } = props;

  const [columnHeights, setColumnHeights] = useState<number[]>(Array(columns).fill(0));
  const containerRef = useRef<ItemRef>(null);
  const itemsRef = useRef<ItemRef[]>([]);

  const getResponsiveColumns = (width: number): number => {
    if (width < 640) return 1;      // sm
    if (width < 768) return 2;      // md
    if (width < 1024) return 3;     // lg
    if (width < 1280) return 4;     // xl
    return columns;                 // 2xl and above
  };

  const calculateLayout = () => {
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const containerWidth = container.offsetWidth;
      const responsiveColumns = getResponsiveColumns(containerWidth);
      const newColumnHeights = Array(responsiveColumns).fill(0);
      const columnWidth = (containerWidth - (gap * (responsiveColumns - 1))) / responsiveColumns;

      itemsRef.current.forEach((item) => {
        if (!item) return;

        const shortestColumn = newColumnHeights.indexOf(Math.min(...newColumnHeights));
        
        item.style.width = `${columnWidth}px`;
        item.style.transform = `translate(${shortestColumn * (columnWidth + gap)}px, ${newColumnHeights[shortestColumn]}px)`;

        const itemHeight = item.offsetHeight;
        newColumnHeights[shortestColumn] += itemHeight + gap;
      });

      container.style.height = `${Math.max(...newColumnHeights) - gap}px`;
      setColumnHeights(newColumnHeights);
    });
  };

  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, React.Children.count(children));

    const observer = new ResizeObserver(() => {
      calculateLayout();
    });

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, [children, columns, gap]);

  useEffect(() => {
    calculateLayout();
  }, [children, columns, gap]);

  const setItemRef = (index: number) => (element: ItemRef) => {
    itemsRef.current[index] = element;
  };

  const containerClasses = `relative w-full ${className}`.trim();

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={{ minHeight: Math.min(...columnHeights) }}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          ref={setItemRef(index)}
          className="absolute transition-transform duration-300 ease-in-out"
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default MasonryLayout;