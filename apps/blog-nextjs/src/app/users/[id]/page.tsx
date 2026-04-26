import "./page.css";
import { IUser } from "#types/user";

export interface IProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function User(props: IProps) {
  let { id } = await props.params;
  let user: IUser = await fetch(`https://jsonplaceholder.org/users/${id}`).then(
    (res) => res.json(),
  );

  return (
    <div className="w-lg m-auto my-20 bg-white text-black p-4 rounded-2xl">
      <div className="flex gap-4 ">
        <img
          src="https://placehold.co/50x50"
          alt={user.firstname}
          className="rounded-full align-middle"
        />
        <div>
          <div>
            {user.firstname} {user.lastname}
          </div>
          <div>{user.email}</div>
        </div>
      </div>

      <hr className="bg-gray-500 opacity-50 my-4" />

      <div className="flex flex-col">
        <div>
          <span className="key">address</span>
          <span className="value">
            {user.address.street}, {user.address.city}
          </span>
        </div>

        <div>
          <span className="key">phone</span>
          <span className="value">{user.phone}</span>
        </div>

        <div>
          <span className="key">website</span>
          <span className="value">{user.website}</span>
        </div>

        <div>
          <span className="key">company</span>
          <span className="value">{user.company.name}</span>
        </div>
      </div>
    </div>
  );
}
