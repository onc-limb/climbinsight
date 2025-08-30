import { markdownToHtml } from '@/lib/markdownConverter';
import path from 'path';

const termsMarkdownPath = path.join(process.cwd(), 'src', 'contents', 'terms.md');

export default async function TermsPage() {
  let contentHtml = '';
  try {
    contentHtml = await markdownToHtml(termsMarkdownPath);
  } catch (error) {
    // エラーが発生した場合のフォールバック
    console.error(error)
    contentHtml = '<p>利用規約の読み込み中にエラーが発生しました。</p>';
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div
        // Tailwind CSSのProseプラグインを使うと、マークダウンから生成されたHTMLに自動でスタイルを適用できます
        // npm install @tailwindcss/typography が必要
        className="prose prose-sm sm:prose max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}