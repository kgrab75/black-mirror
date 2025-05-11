import Loader from '@/app/components/Loader';
import TextFit from '@/app/components/TextFit';
import { WeightProps } from '@/app/lib/definitions';
import { faCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Pusher from 'pusher-js';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';
import {
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface Measure {
  value: number;
  type: number;
  unit: number;
  algo: number;
  fm: number;
}

interface MeasureEntry {
  grpid: number;
  attrib: number;
  date: number; // Timestamp
  created: number; // Timestamp
  modified: number; // Timestamp
  category: number;
  deviceid: string;
  hash_deviceid: string;
  measures: Measure[];
  modelid: number;
  model: string;
  comment: string | null;
}

interface Data {
  name: Date;
  date: number;
  value: number; // Poids en kilogrammes
}

interface MeasureInfo {
  type: number;
  label: string;
  color: string;
  trend: {
    positive: string;
    neutral: string;
    negative: string;
  };
}

const measureInfos: MeasureInfo[] = [
  {
    type: 1,
    label: 'Poids',
    color: '#8884d8',
    trend: {
      positive: 'Prise de poids',
      neutral: 'Stable',
      negative: 'Perte de poids',
    },
  },
  {
    type: 8,
    label: 'Masse grasse',
    color: '#eadb72',
    trend: {
      positive: 'Prise de graisse',
      neutral: 'Stable',
      negative: 'Perte de graisse',
    },
  },
];

export default function Weight({ id, options, height }: WeightProps) {
  const [loading, setLoading] = useState(true);
  const [measures, setMeasures] = useState<MeasureEntry[]>([]);
  const [measureInfo, setMeasureInfo] = useState<MeasureInfo>(measureInfos[0]);
  const [accessToken, setAccessToken] = useState(options.access_token || '');

  const startDate = new Date('2025-05-12');
  const targetWeight = options.targetWeight || 75;
  const durationInWeeks = options.durationInWeeks || 10;

  const ref = useRef(null);
  const hasAccess = !!accessToken;

  useSpeechRecognition({
    commands: [
      {
        command: ['Affiche le poids', 'Affiche mon poids'],
        callback: () => {
          setMeasureInfo(measureInfos[0]);
        },
      },
      {
        command: [
          'Affiche la masse graisseuse',
          'Affiche ma masse graisseuse',
          'Affiche la graisse',
          'Affiche ma graisse',
          'Affiche mon gras',
        ],
        callback: () => {
          setMeasureInfo(measureInfos[1]);
        },
      },
    ],
  });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PUSHER_APP_KEY) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: 'eu',
      });

      const channel = pusher.subscribe('black-mirror');
      channel.bind('token-loaded', (data: { access_token?: string }) => {
        setAccessToken(data.access_token || '');
      });
      return () => {
        channel.unbind('token-loaded');
        pusher.unsubscribe('black-mirror');
      };
    }
  }, []);

  useEffect(() => {
    const getWeights = async (displayLoading = true) => {
      try {
        displayLoading && setLoading(true);

        const response = await fetch(
          `/api/withings/measures?moduleId=${id}&type=${measureInfo.type}`,
        );
        const { measures: newMeasures }: { measures: MeasureEntry[] } =
          await response.json();

        if (newMeasures) {
          setMeasures(newMeasures);
        }
      } catch (error) {
        console.error('Error fetching measures:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      getWeights();
      const interval = setInterval(() => getWeights(false), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [measureInfo, accessToken, hasAccess]);

  const auth = new URL(
    `/api/withings/url?moduleId=${id}`,
    process.env.NEXT_PUBLIC_REAL_BASE_URL,
  ).toString();

  const data = transformMeasuresToChartData(measures);

  const lastMeasure = data.at(-1);
  const latestWeight = lastMeasure?.value;
  const trend = calculateTrendFromDataPoints(data);

  const trendLabel =
    trend > 0
      ? measureInfo.trend.positive
      : trend < 0
        ? measureInfo.trend.negative
        : measureInfo.trend.neutral;

  const nextTargetWeight = calculateTargetWeight(
    startDate,
    findStartWeight(data, startDate),
    targetWeight,
    durationInWeeks,
  );

  const difference = (latestWeight || nextTargetWeight) - nextTargetWeight;
  const formatted = `${nextTargetWeight} (${difference > 0 ? '+' : ''}${difference.toFixed(1)})`;
  return (
    <div className="relative size-full px-1" ref={ref}>
      {loading && hasAccess ? (
        <Loader />
      ) : (
        <>
          {hasAccess ? (
            <TextFit widthFactor={0.1} heightFactor={0.1} refParent={ref}>
              <div className="flex flex-col h-full justify-between">
                <div className="head flex justify-between w-full text-[0.7em]">
                  <div className="label">{measureInfo.label}</div>
                  <div className="date capitalize">
                    {lastMeasure?.name.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
                <div className="measure text-[2em] flex justify-center">
                  <div className="last-weight flex items-baseline">
                    <div className="value">{lastMeasure?.value}</div>
                    <div className="unit text-[0.5em]">kg</div>
                  </div>
                </div>
                <div className="graph h-1/3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data}
                      margin={{ top: 35, right: 30, bottom: 20, left: 30 }}
                    >
                      <Line
                        type="linear"
                        dataKey="value"
                        label={{
                          fill: 'white',
                          fontSize: '0.5em',
                          dy: -20,
                          dx: -5,
                          fontWeight: 'bold',
                        }}
                        dot={{
                          stroke: measureInfo.color,
                          strokeWidth: 3,
                          r: 6,
                          fill: 'black',
                        }}
                        stroke={measureInfo.color}
                        strokeWidth={2}
                      />
                      <ReferenceLine
                        y={nextTargetWeight}
                        stroke="yellow"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        label={
                          <Label
                            value={formatted}
                            position="insideBottomLeft"
                            fill="yellow"
                            fontSize="0.5em"
                          />
                        }
                      />
                      <YAxis
                        hide={true}
                        domain={[nextTargetWeight, 'dataMax']}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="trend flex justify-center w-full  text-[0.7em]">
                  <div className="icon">
                    <FontAwesomeIcon
                      icon={faCircleRight}
                      className={clsx(
                        trend > 0 && '-rotate-45',
                        trend < 0 && 'rotate-45',
                      )}
                    />
                  </div>
                  <div className="label">{trendLabel}</div>
                </div>
              </div>
            </TextFit>
          ) : (
            <div className="flex items-center flex-col">
              <QRCodeCanvas value={auth} size={height * 150} marginSize={1} />
              <a href={auth} target="_blank">
                {auth}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function convertWeight(value: number, unit: number): number {
  const weightInKg = value * Math.pow(10, unit);
  return Math.round(weightInKg * 10) / 10;
}

function transformMeasuresToChartData(measures: MeasureEntry[]) {
  const chartData = measures
    .map((measure) => {
      // Trouver la mesure correspondant au poids (type: 1 pour le poids)
      const weightMeasure = measure.measures;

      // Conversion du poids (value * 10^unit)
      const weightValue = convertWeight(
        weightMeasure[0].value,
        weightMeasure[0].unit,
      );

      // Conversion de la date UNIX en format lisible (par exemple: "18 Sept.")
      const date = new Date(measure.date * 1000);

      return {
        name: date,
        date: date.valueOf(),
        value: parseFloat(weightValue.toFixed(1)), // Arrondir à une décimale
        goal: null,
      };
    })
    .filter(Boolean) // Filtrer les valeurs nulles
    .slice(0, 5)
    .reverse() as Data[];

  return chartData;
}

function calculateTrendFromDataPoints(data: Data[]): number {
  const n = data.length;

  // Convertir les dates en timestamps
  const timestamps = data.map((point) => point.name.getTime());

  // Sommes nécessaires pour la régression linéaire
  const sumX = timestamps.reduce((acc, timestamp) => acc + timestamp, 0); // somme des timestamps
  const sumY = data.reduce((acc, point) => acc + (point.value || 0), 0); // somme des valeurs
  const sumXY = data.reduce(
    (acc, point, index) => acc + timestamps[index] * (point.value || 0),
    0,
  ); // somme des produits timestamp * valeur
  const sumX2 = timestamps.reduce(
    (acc, timestamp) => acc + timestamp * timestamp,
    0,
  ); // somme des carrés des timestamps

  // Calcul de la pente (m)
  const numerator = n * sumXY - sumX * sumY; // numérateur
  const denominator = n * sumX2 - sumX * sumX; // dénominateur

  // Si le dénominateur est 0, la tendance ne peut pas être calculée
  if (denominator === 0) {
    return 0;
  }

  // Retourner la pente
  return numerator / denominator;
}

function findStartWeight(entries: Data[], startDate: Date): number {
  const startTimestamp = startDate.getTime();

  // Filter entries before or at the start date
  const beforeOrEqual = entries.filter((e) => e.date <= startTimestamp);

  // If we have past entries, take the latest one
  if (beforeOrEqual.length > 0) {
    const latest = beforeOrEqual.reduce((a, b) => (a.date > b.date ? a : b));
    return latest.value;
  }

  // Otherwise, take the earliest future entry
  const after = entries.filter((e) => e.date > startTimestamp);
  if (after.length > 0) {
    const earliest = after.reduce((a, b) => (a.date < b.date ? a : b));
    return earliest.value;
  }

  // No data available
  return 85;
}

function calculateTargetWeight(
  startDate: Date,
  startWeight: number,
  targetWeight: number,
  durationInWeeks: number,
): number {
  const currentDate = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksElapsed = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / msPerWeek,
  );

  if (weeksElapsed <= 0) return startWeight;
  if (weeksElapsed >= durationInWeeks) return targetWeight;

  const progress = weeksElapsed / durationInWeeks;
  const currentTarget = startWeight + (targetWeight - startWeight) * progress;

  return parseFloat(currentTarget.toFixed(1)); // round to 1 decimal place
}
