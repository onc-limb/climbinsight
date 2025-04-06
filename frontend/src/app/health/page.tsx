// app/page.tsx または SSRしたいページ
export const runtime = 'edge';
export const dynamic = "force-dynamic"

export default async function HealthPage() {
  const res = await fetch("https://example.com/api")
  const data = await res.json()

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
