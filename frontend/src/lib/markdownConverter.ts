import { remark } from "remark";
import html from "remark-html";
import { promises as fs } from "fs"; // Node.jsのファイルシステムモジュール

/**
 * 指定されたパスのマークダウンファイルを読み込み、HTML文字列に変換します。
 * @param filePath マークダウンファイルの絶対パス
 * @returns 変換されたHTML文字列
 */
export async function markdownToHtml(filePath: string): Promise<string> {
  try {
    const markdown = await fs.readFile(filePath, "utf-8");
    const result = await remark().use(html).process(markdown);
    return result.toString();
  } catch (error) {
    console.error(
      `Error reading or processing markdown file at ${filePath}:`,
      error
    );
    // エラーハンドリングとして空文字列やエラーメッセージを返すことも検討
    throw new Error(`Failed to convert markdown from ${filePath}`);
  }
}
