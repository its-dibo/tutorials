import { INextPrayer } from "#app/page";

export interface IProps {
  time: string;
  city: string;
  nextPrayer?: INextPrayer;
}

export function Header(props: IProps) {
  let { time, city, nextPrayer } = props;

  return (
    <div id="header">
      <div>
        <div className="text-2xl my-2">{city}</div>
        <div>{time}</div>
      </div>

      <div>
        <div className="text-2xl my-2">Next Prayer</div>
        <div>{nextPrayer?.prayer}</div>
      </div>

      <div>
        <div className="text-2xl my-2">remaining time to Adhan</div>
        <div>{nextPrayer?.remainingTime}</div>
      </div>
    </div>
  );
}
