'use client'
import { GRADES } from "@/const/grade.const";
import { useResultStore } from "@/stores/resultStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";


export default function ContentsInputForm() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [gym, setGym] = useState("");
  const [style, setStyle] = useState("");
  const [tryCount, setTryCount] = useState<number| undefined>();
  const [isGenerate, setIsGenerate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = useResultStore.getState().session

  const handleGradeChange = (value: string) => {
    setGrade(value);
    };

  const handleSubmit = async () => {
    if (!gym || !style || tryCount === undefined) {
      setError("全ての項目を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);
    const body = JSON.stringify({
      sessionId,
      grade,
      gym,
      style,
      tryCount,
      isGenerate
    })

    try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/contents/generate", {
        method: "POST",
        body: body,
      });

      if (!res.ok) {
        throw new Error("サーバーとの通信に失敗しました。");
      }

      router.push(`/hold-extraction/result?session=${sessionId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">ClimbInsight</h1>
      <p className="text-sm sm:text-base text-gray-600">課題の情報を入力してハッシュタグを作成しよう！</p>
      <div className="container mx-auto space-y-4">
        <div className='space-y-2'>
          <Label htmlFor="grade" className="block text-sm font-medium">グレード</Label>
          <Select onValueChange={handleGradeChange} value={grade}>
            <SelectTrigger id="grade" className="w-full">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gym" className="block text-sm font-medium">ジム名</Label>
          <Input
            type="text"
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="例: B-PUMP 荻窪"
          />
        </div>

        <div>
          <Label htmlFor="style" className="block text-sm font-medium">課題スタイル</Label>
          <Input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="例: スラブ / ルーフ / 足自由 など"
          />
        </div>
      </div>
        <div>
          <Label htmlFor="tryCount" className="block text-sm font-medium">トライ回数</Label>
          <Input
            type="number"
            value={tryCount}
            onChange={(e) => setTryCount(e.target.value ? Number(e.target.value): undefined)}
            className="border rounded px-2 py-1 w-full"
            placeholder="トライ回数を入力してください"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="checkbox"
            checked={isGenerate}
            onChange={(e) => setIsGenerate(e.target.checked)}
            id="is-generate"
            className="w-4 h-4"
          />
          <Label htmlFor="is-generate" className="text-sm font-medium">
            SNSの投稿文を自動で生成する
          </Label>
        </div>

      {error && <p className="text-red-600 text-sm">⚠ {error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full sm:w-auto bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
      >
        {loading ? "送信中..." : "送信する"}
      </Button>
    </main>
  );
}