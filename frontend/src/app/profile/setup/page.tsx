
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">プロフィール設定</h1>
      <div className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="displayName">表示名</Label>
          <Input id="displayName" placeholder="表示名を入力してください" />
        </div>
        <div>
          <Label htmlFor="height">身長 (cm)</Label>
          <Input id="height" type="number" placeholder="身長を入力してください" />
        </div>
        <div>
          <Label htmlFor="horizontalReach">横リーチ (cm)</Label>
          <Input id="horizontalReach" type="number" placeholder="横リーチを入力してください" />
        </div>
        <div>
          <Label htmlFor="verticalReach">縦リーチ (cm)</Label>
          <Input id="verticalReach" type="number" placeholder="縦リーチを入力してください" />
        </div>
        <Button>プロフィールを保存</Button>
      </div>
    </div>
  );
}
