import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col justify-center items-center">
      <div className="flex flex-row gap-2">
        <Link href="/create">
          <button className="border border-white p-2 rounded-lg">
            create
          </button>
        </Link>
        <Link href="/manage">
          <button className="border border-white p-2 rounded-lg">
            manage
          </button>
        </Link>
      </div>
    </main>
  );
}
