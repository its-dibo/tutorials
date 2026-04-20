"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { Divider } from "./components/Divider";
import { Times, Timings } from "./components/Times";
import { Temporal } from "@js-temporal/polyfill";
import { useEffect } from "react";

export interface INextPrayer {
  // todo: keyof Timings
  prayer: string;
  prayerTime: string;
  remainingTime: string;
}

export default function Home() {
  let [country, setCountry] = useState("eg");
  let [city, setCity] = useState("cairo");
  let [nextPrayer, setNextPrayer] = useState<INextPrayer>();
  let [timings, setTimings] = useState<Timings>();

  let { now, date, time } = getDate("Africa/Cairo");

  useEffect(() => {
    if (timings) {
      let next = getNextPrayer(timings, now);
      setNextPrayer(next);
    }
  }, [timings]);

  return (
    <div id="container" className="p-10 bg-cyan-950">
      <div className="mb-4 flex gap-4">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded bg-white px-2 py-1 text-black"
        >
          <option value="eg">Egypt</option>
        </select>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded bg-white px-2 py-1 text-black"
        >
          <option value="cairo">Cairo</option>
          <option value="Alexandria">Alexandria</option>
        </select>
      </div>
      <Header time={time} city={city} nextPrayer={nextPrayer} />
      <Divider />
      <Times
        country={country}
        city={city}
        date={date}
        setTimings={setTimings}
      />
    </div>
  );
}

export function getDate(timeZone: string) {
  // todo: handle time zones
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  // format date: 01/02/2000
  // or use `Intl.DateTimeFormat()`
  const date = [
    String(now.day).padStart(2, "0"),
    String(now.month).padStart(2, "0"),
    now.year,
  ].join("-");

  // format time: HH:mm
  const time = [
    String(now.hour).padStart(2, "0"),
    String(now.minute).padStart(2, "0"),
  ].join(":");

  return { now, date, time };
}

export function getNextPrayer(
  timings: Timings,
  now: Temporal.ZonedDateTime,
): INextPrayer | undefined {
  for (let prayer of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
    let prayerTime = timings[prayer as keyof Timings];
    if (Temporal.PlainTime.compare(prayerTime, now) > 0) {
      // use `now.with()` as it includes a time zone
      let targetTime = now.withPlainTime(Temporal.PlainTime.from(prayerTime));
      let remainingTime = now.until(targetTime);

      return {
        prayer,
        prayerTime,
        remainingTime: `${remainingTime.hours}:${remainingTime.minutes}`,
      };
    }
  }

  return undefined;
}
