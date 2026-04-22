import "./Card.css";
import Link from "next/link";

export interface ICard {
  title: string;
  content: string;
  image: string;
  url: string;
  className?: string;
}

export function Card(data: ICard) {
  return (
    <div
      className={`card border-2 rounded-2xl border-gray-500 p-4 ${data.className || ""}`}
    >
      <h2 className="title">{data.title}</h2>
      <img src={data.image} alt={data.title} className="my-4 w-full" />
      <div className="body">{data.content.slice(0, 500)}</div>
      <div className="footer flex gap-1 mt-4">
        <Link href={`${data.url}`} className="bg-(--accent) p-4 rounded-2xl">
          Read more...
        </Link>
      </div>
    </div>
  );
}
