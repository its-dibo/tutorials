export interface IProps {
  title: string;
  time: string;
  image: string;
}

export function Card(props: IProps) {
  let { title, time, image } = props;

  return (
    <div className="card  border-gray-500 rounded-lg bg-cyan-700">
      <img src={image} alt={title} />
      <div className="p-5">
        <h2>{title}</h2>
        <p>{time}</p>
      </div>
    </div>
  );
}
