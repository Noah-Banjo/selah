import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import characters from '../data/characters.json';

const START = -2000;
const END = 100;

const TICKS = [
  -2000, -1800, -1600, -1400, -1200, -1000, -800, -600, -400, -200, 0, 100,
];

const H_PX_PER_YEAR = 2.6;
const H_PAD = 80;
const H_WIDTH = (END - START) * H_PX_PER_YEAR + H_PAD * 2;
const H_LANE_HEIGHT = 86;
const H_AXIS_OFFSET = 110;
const H_MIN_LANE_GAP_PX = 64;

const V_PX_PER_YEAR = 1.6;
const V_PAD = 60;
const V_HEIGHT = (END - START) * V_PX_PER_YEAR + V_PAD * 2;
const V_LANE_WIDTH = 140;
const V_AXIS_LEFT = 78;
const V_MIN_LANE_GAP_PX = 34;

const yearToX = (year) =>
  H_PAD + (Math.max(START, Math.min(END, year)) - START) * H_PX_PER_YEAR;

const yearToY = (year) =>
  V_PAD + (Math.max(START, Math.min(END, year)) - START) * V_PX_PER_YEAR;

const ERAS = [
  { id: 'patriarchs', from: -2000, to: -1500, label: 'Patriarchs', accent: '#D8932F' },
  { id: 'exodus', from: -1500, to: -1200, label: 'Exodus', accent: '#5A8CD8' },
  { id: 'judges', from: -1200, to: -1050, label: 'Judges', accent: '#5AB880' },
  { id: 'kings', from: -1050, to: -586, label: 'Kings & Prophets', accent: '#A47AD8' },
  { id: 'exile', from: -586, to: -538, label: 'Exile', accent: '#D86060' },
  { id: 'temple', from: -538, to: -4, label: 'Second Temple', accent: '#4FB8B8' },
  { id: 'nt', from: -4, to: 100, label: 'New Testament', accent: '#C9A84C' },
];

const formatYear = (year) => {
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '0';
  return `${year} AD`;
};

function assignLanes(items, axisKey, minGap) {
  const lanes = [];
  for (const item of items) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const last = lanes[i][lanes[i].length - 1];
      if (item[axisKey] - last[axisKey] >= minGap) {
        lanes[i].push(item);
        item.lane = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      item.lane = lanes.length;
      lanes.push([item]);
    }
  }
  return lanes.length;
}

function useIsMobile() {
  const query = '(max-width: 720px)';
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

function Legend() {
  return (
    <ul className="timeline-legend">
      {ERAS.map((era) => (
        <li key={era.id} className="timeline-legend__item">
          <span
            className="timeline-legend__swatch"
            style={{ backgroundColor: era.accent }}
            aria-hidden="true"
          />
          <span className="timeline-legend__label">{era.label}</span>
        </li>
      ))}
    </ul>
  );
}

function HorizontalTimeline({ data }) {
  const { items, laneCount } = useMemo(() => {
    const sorted = data
      .filter((c) => typeof c.birthYear === 'number')
      .map((c) => ({
        ...c,
        x: yearToX(c.birthYear),
        clamped: c.birthYear < START,
      }))
      .sort((a, b) => a.x - b.x);
    const lanes = assignLanes(sorted, 'x', H_MIN_LANE_GAP_PX);
    return { items: sorted, laneCount: lanes };
  }, [data]);

  const trackHeight = H_AXIS_OFFSET + (laneCount - 1) * H_LANE_HEIGHT + 130;

  return (
    <div
      className="timeline-scroll timeline-scroll--horizontal"
      role="region"
      aria-label="Biblical timeline, horizontal"
    >
      <div
        className="timeline-track"
        style={{ width: H_WIDTH, height: trackHeight }}
      >
        {ERAS.map((era) => {
          const left = yearToX(era.from);
          const width = yearToX(era.to) - left;
          return (
            <div
              key={era.id}
              className={`timeline-era timeline-era--${era.id}`}
              style={{ left, width, top: 0, height: trackHeight }}
            >
              <span className="timeline-era__label">{era.label}</span>
            </div>
          );
        })}

        <div className="timeline-axis" style={{ top: H_AXIS_OFFSET }} />

        {TICKS.map((year) => (
          <div
            key={year}
            className="timeline-tick"
            style={{ left: yearToX(year), top: H_AXIS_OFFSET - 16 }}
          >
            <span className="timeline-tick__line" aria-hidden="true" />
            <span className="timeline-tick__label">{formatYear(year)}</span>
          </div>
        ))}

        {items.map((c) => {
          const top = H_AXIS_OFFSET + 8 + c.lane * H_LANE_HEIGHT;
          const lineHeight = top - H_AXIS_OFFSET;
          return (
            <Link
              key={c.id}
              to={`/characters/${c.id}`}
              className={`timeline-stop${c.clamped ? ' timeline-stop--clamped' : ''}`}
              style={{ left: c.x, top }}
              aria-label={`${c.name}, ${c.period}`}
            >
              <span
                className="timeline-stop__line"
                style={{ height: lineHeight }}
                aria-hidden="true"
              />
              <span className="timeline-stop__dot" aria-hidden="true" />
              <span className="timeline-stop__label">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function VerticalTimeline({ data }) {
  const { items, laneCount } = useMemo(() => {
    const sorted = data
      .filter((c) => typeof c.birthYear === 'number')
      .map((c) => ({
        ...c,
        y: yearToY(c.birthYear),
        clamped: c.birthYear < START,
      }))
      .sort((a, b) => a.y - b.y);
    const lanes = assignLanes(sorted, 'y', V_MIN_LANE_GAP_PX);
    return { items: sorted, laneCount: lanes };
  }, [data]);

  const trackWidth = V_AXIS_LEFT + laneCount * V_LANE_WIDTH + 16;

  return (
    <div
      className="timeline-scroll timeline-scroll--vertical"
      role="region"
      aria-label="Biblical timeline, vertical"
    >
      <div
        className="timeline-vtrack"
        style={{ width: trackWidth, height: V_HEIGHT + 40 }}
      >
        {ERAS.map((era) => {
          const top = yearToY(era.from);
          const height = yearToY(era.to) - top;
          return (
            <div
              key={era.id}
              className={`timeline-vera timeline-vera--${era.id}`}
              style={{ top, height, left: 0, right: 0 }}
            >
              <span className="timeline-vera__label">{era.label}</span>
            </div>
          );
        })}

        <div className="timeline-vaxis" style={{ left: V_AXIS_LEFT }} />

        {TICKS.map((year) => (
          <div
            key={year}
            className="timeline-vtick"
            style={{ top: yearToY(year), left: 0, width: V_AXIS_LEFT + 12 }}
          >
            <span className="timeline-vtick__label">{formatYear(year)}</span>
          </div>
        ))}

        {items.map((c) => {
          const left = V_AXIS_LEFT + 18 + c.lane * V_LANE_WIDTH;
          return (
            <Link
              key={c.id}
              to={`/characters/${c.id}`}
              className={`timeline-vstop${c.clamped ? ' timeline-vstop--clamped' : ''}`}
              style={{ top: c.y, left }}
              aria-label={`${c.name}, ${c.period}`}
            >
              <span
                className="timeline-vstop__dot"
                style={{ left: -left + V_AXIS_LEFT }}
                aria-hidden="true"
              />
              <span
                className="timeline-vstop__connector"
                style={{ left: -left + V_AXIS_LEFT + 6, width: left - V_AXIS_LEFT - 12 }}
                aria-hidden="true"
              />
              <span className="timeline-vstop__label">
                <strong>{c.name}</strong>
                <span>{c.period}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TimelinePage() {
  const isMobile = useIsMobile();

  return (
    <section className="page timeline-page">
      <div className="page__inner">
        <header className="page__header">
          <span className="page__eyebrow">Chronology</span>
          <h1 className="page__title">Timeline</h1>
          <p className="page__lede">
            Two thousand years of biblical lives, plotted from the patriarchs to
            the apostles. {isMobile
              ? 'Scroll down to walk the chronology — tap any name to read the profile.'
              : 'Scroll across to walk the chronology — click any name to read the profile.'}
          </p>
        </header>

        <Legend />

        {isMobile ? (
          <VerticalTimeline data={characters} />
        ) : (
          <HorizontalTimeline data={characters} />
        )}

        <p className="timeline-note">
          Birth-year estimates follow traditional biblical chronology and are
          approximate, especially for the patriarchal era. Noah&apos;s
          traditional date predates the timeline span and is shown at the left
          edge.
        </p>
      </div>
    </section>
  );
}

export default TimelinePage;
