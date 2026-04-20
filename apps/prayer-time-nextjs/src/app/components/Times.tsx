import { useEffect } from "react";
import { Card } from "./Card";
import { useState } from "react";

export interface IProps {
  country: string;
  city: string;
  date: string;
  // todo: add type
  setTimings?: any;
}

export interface Timings {
  Asr: string;
  Dhuhr: string;
  Fajr: string;
  Firstthird: string;
  Imsak: string;
  Isha: string;
  Lastthird: string;
  Maghrib: string;
  Midnight: string;
  Sunrise: string;
  Sunset: string;
}

export function Times(props: IProps) {
  let { country, city, date } = props;
  let [timings, setTimings] = useState<Timings>();

  useEffect(() => {
    fetch(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=${country}`,
      {
        headers: {
          "Accept-Encoding": "",
        },
      },
    )
      .then((res) => res.json())
      .then((res) => res.data.timings)
      .then((res) => {
        setTimings(res);
        props.setTimings(res);
      });
  }, [country, city, date]);

  if (!timings) {
    return;
  }

  return (
    <div id="details" className="flex justify-between gap-1">
      <Card
        title="Fajr"
        time={timings.Fajr}
        image="https://placehold.co/600x400?text=Fajr"
      />
      <Card
        title="Duhr"
        time={timings.Dhuhr}
        image="https://placehold.co/600x400?text=Duhr"
      />
      <Card
        title="Asr"
        time={timings.Asr}
        image="https://placehold.co/600x400?text=Asr"
      />
      <Card
        title="Maghreb"
        time={timings.Maghrib}
        image="https://placehold.co/600x400?text=Maghreb"
      />
      <Card
        title="Ishaa"
        time={timings.Isha}
        image="https://placehold.co/600x400?text=Ishaa"
      />
    </div>
  );
}
