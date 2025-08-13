import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface IntroductionProps {
  introduction?: string;
}

export default function Introduction({ introduction }: IntroductionProps) {
  if (!introduction) return null;

  return (
    <Card className="shadow-lg border-orange-200">
      <CardHeader>
        <CardTitle className="text-xl text-orange-900">自己紹介</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {introduction}
        </p>
      </CardContent>
    </Card>
  );
}