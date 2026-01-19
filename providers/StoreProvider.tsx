// lib/StoreProvider.tsx
'use client'
import { Provider } from 'react-redux'
import { getStore } from '@/lib/redux/store'

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode
}) {
 const store = getStore();
  return <Provider store={store}>{children}</Provider>;

}