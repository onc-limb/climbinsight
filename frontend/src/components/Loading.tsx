export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-white animate-spin" />
      </div>
      <p className="mt-6 text-xl font-light tracking-widest">
        HOLDING ON TO YOUR DATA...
      </p>
      <p className="text-sm text-gray-400 mt-2">
        クライミングの課題をセット中です🧗‍♂️
      </p>
    </div>
  )
}
