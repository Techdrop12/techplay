// ✅ src/components/PageTransitions.js

'use client';
import { usePathname } from 'next/navigation';
import MotionWrapper from './MotionWrapper';

export default function PageTransitions({ children }) {
  const pathname = usePathname();
  return <MotionWrapper keyId={pathname}>{children}</MotionWrapper>;
}
