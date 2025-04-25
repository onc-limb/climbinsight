import Result from '@/components/client/result';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <Result />
    </Suspense>
  );
}
