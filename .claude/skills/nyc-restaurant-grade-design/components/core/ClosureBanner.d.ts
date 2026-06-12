import * as React from "react";

/**
 * The closure banner shown at the top of a result card when a restaurant
 * is currently closed by DOHMH: translucent red fill, red hairline,
 * "⚠ Closed by DOHMH · {date}". The one red element in the system —
 * closures are the only state graver than a C.
 */
export interface ClosureBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Formatted closure date, e.g. "Apr 9, 2025". */
  date?: string;
}

export function ClosureBanner(props: ClosureBannerProps): JSX.Element;
