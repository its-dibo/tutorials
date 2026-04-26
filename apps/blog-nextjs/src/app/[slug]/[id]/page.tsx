import { IPost } from "#types/post";
import { IUser } from "#types/user";

export interface IProps {
  params: Promise<{ id: string; slug: string }>;
}

export default async function PostDetails(props: IProps) {
  const { id } = await props.params;
  let data: IPost = await fetch(`https://jsonplaceholder.org/posts/${id}`).then(
    (res) => res.json(),
  );

  let user: IUser = await fetch(
    `https://jsonplaceholder.org/users/${data.userId}`,
  ).then((res) => res.json());

  console.log(data);
  return (
    <div className="w-4xl m-auto">
      <h1>{data.title}</h1>

      <img src={data.image} alt={data.title} className="block m-auto my-4" />

      <div className="flex justify-between text-gray-500 italic">
        <div>
          <a href={`/users/${user.id}`}>
            {user.firstname} {user.lastname}
          </a>
        </div>
        <div>{data.publishedAt}</div>
      </div>

      <div>{data.content}</div>
    </div>
  );
}
