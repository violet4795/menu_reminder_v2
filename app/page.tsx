import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <div>
          <label htmlFor="dooray-webhook-url">dooray webhook url을 입력하세요. </label><input id="dooray-webhook-url" className="w-full text-black" />
        </div>
        <div className="mt-6">

        </div>
      </div>
    </main>
  )
}
