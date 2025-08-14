import React from "react";
import ImageUploadForm from "@/components/client/image-upload-form";
import Membership from "@/components/client/membership";

export default function TopPage() {

  return (
    <>
      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-4xl font-bold">ClimbSnap</h1>
        <p className="text-lg sm:text-xl text-gray-600">
          壁の写真を選択、ホールドをクリックして、課題のカバー画像を作成しよう
        </p>

        <ImageUploadForm />
        <h2 className="text-xl sm:text-2xl font-bold">✏️ 使い方ガイド</h2>
        <ul className="list-inside space-y-4 sm:space-y-6">
          <li>
            <p className="text-base sm:text-lg font-semibold">
              1. 課題の写真を選んでください
            </p>
            <p className="text-sm sm:text-base text-gray-700 mt-2">
              壁全体が写っているJPEG / PNG / HEIC
              画像をアップロードしてください。
            </p>
          </li>
          <li>
            <p className="text-base sm:text-lg font-semibold">
              2. 課題のホールドを指定してください
            </p>
            <p className="text-sm sm:text-base text-gray-700 mt-2">
              写真上で、登るホールドをクリックまたはタップしてください。
              <br />
              クリックしたホールドが自動で抽出されます。
            </p>
            <ul className="list-disc list-inside text-gray-600 text-xs sm:text-sm mt-2 ml-4">
              <li>
                同じホールドをもう一度クリックすると、選択を取り消すことができます。
              </li>
              <li>
                ホールドの中心かつ色がわかりやすい部分をクリックすると、加工の精度が向上します。
              </li>
            </ul>
          </li>
          <li>
            <p className="text-base sm:text-lg font-semibold">
              3. 「画像を送信する」を押すと、画像が送信されます
            </p>
            <p className="text-sm sm:text-base text-gray-700 mt-2">
              指定したホールド情報を元に、写真を自動で加工します。
              <br />
              加工が完了すると、加工済みの画像と課題情報をダウンロードできるようになります！
            </p>
          </li>
        </ul>
      </main>
      <Membership/>
    </>
  );
}
