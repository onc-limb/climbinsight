'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const categories = [
  { id: 'service-question', label: 'サービスに関する質問' },
  { id: 'bug-report', label: '不具合の報告' },
  { id: 'feature-request', label: 'ご意見・ご要望' },
  { id: 'other', label: 'その他' },
];

export default function ContactForm() {
  const [category, setCategory] = useState('');
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

   const handleCategoryChange = (value: string) => {
    setCategory(value);
    // 選択されたIDに対応するラベルを見つけてstateにセット
    const selected = categories.find(cat => cat.id === value);
    if (selected) {
      setSelectedCategoryLabel(selected.label);
    }};

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/inquery", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, email, message }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // フォームをクリア
        setCategory('');
        setEmail('');
        setMessage('');
      } else {
        setSubmitSuccess(false);
        console.error('お問い合わせの送信に失敗しました。');
      }
    } catch (error) {
      setSubmitSuccess(false);
      console.error('お問い合わせの送信中にエラーが発生しました。', error);
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false); // 送信後にダイアログを閉じる
    }
  };

  const isFormValid = category && email && message && email.includes('@'); // 簡単なバリデーション

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <form className="space-y-4">
        <div className='space-y-2'>
          <Label htmlFor="category">お問い合わせの種類</Label>
          <Select onValueChange={handleCategoryChange} value={category}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor="email">連絡先メールアドレス</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor="message">お問い合わせ本文</Label>
          <Textarea
            id="message"
            placeholder="お問い合わせ内容を詳しくご記入ください。"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" disabled={!isFormValid} className='font-bold w-full'>
              お問い合わせ内容を確認する
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">お問い合わせ内容の確認</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                以下の内容で送信します。よろしければ「送信する」ボタンを押してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">カテゴリー:</Label>
                <span className="text-sm sm:text-base">{selectedCategoryLabel}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">メールアドレス:</Label>
                <span className="text-sm sm:text-base break-all">{email}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">お問い合わせ内容:</Label>
                <span className="text-sm sm:text-base whitespace-pre-wrap break-words">{message}</span>
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className='font-bold w-full sm:w-auto'> 
                キャンセル
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className='font-bold w-full sm:w-auto'>
                {isSubmitting ? '送信中...' : '送信する'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>

      {submitSuccess === true && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 border border-green-200 rounded">
          お問い合わせを送信しました。ありがとうございました！
        </div>
      )}
      {submitSuccess === false && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
          お問い合わせの送信に失敗しました。時間をおいて再度お試しください。
        </div>
      )}
    </div>
  );
}