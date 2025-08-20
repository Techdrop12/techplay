// Strong typings for `react-rating-stars-component`
declare module 'react-rating-stars-component' {
  import type * as React from 'react';

  export interface ReactStarsProps {
    /** number of stars to display (default 5) */
    count?: number;
    /** current value (can be half if isHalf=true) */
    value?: number;
    /** called with the new rating when user selects/changes */
    onChange?: (newRating: number) => void;

    /** star size in px (default 20) */
    size?: number;

    /** enable keyboard & screen-reader interactions (default true) */
    a11y?: boolean;

    /** allow half-star selection & display (default false) */
    isHalf?: boolean;

    /** allow editing (default true). If false, component is read-only */
    edit?: boolean;

    /** single character to render instead of star icons (e.g. '★') */
    char?: string;

    /** base color of inactive stars */
    color?: string;
    /** color of active stars */
    activeColor?: string;

    /** custom icons (override char) */
    emptyIcon?: React.ReactNode;
    halfIcon?: React.ReactNode;
    filledIcon?: React.ReactNode;

    /** optional extra class names on the root element */
    classNames?: string;

    /** optional id for a11y/tests */
    id?: string;

    /** mouse enter/leave on a star – useful for previews */
    onIconHover?: (index: number, value: number) => void;
    onIconLeave?: () => void;
  }

  const ReactStars: React.ComponentType<ReactStarsProps>;
  export default ReactStars;
}
