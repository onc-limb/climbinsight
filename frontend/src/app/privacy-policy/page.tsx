import { markdownToHtml } from '@/lib/markdownConverter';
import path from 'path';

const policyMarkdownPath = path.join(process.cwd(), 'src', 'contents', 'privacy-policy.md');

export default async function TermsPage() {
  let contentHtml = '';
  try {
    contentHtml = await markdownToHtml(policyMarkdownPath);
  } catch (error) {
    // エラーが発生した場合のフォールバック
    console.error(error)
    contentHtml = '<p>プライバシーポリシーの読み込み中にエラーが発生しました。</p>';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        // Tailwind CSSのProseプラグインを使うと、マークダウンから生成されたHTMLに自動でスタイルを適用できます
        // npm install @tailwindcss/typography が必要
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}