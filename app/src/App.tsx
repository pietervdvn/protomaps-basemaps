import { useState, useEffect, useRef, useCallback } from "react";
import "tachyons/css/tachyons.min.css";
import { Toner } from "../../extra/src/stamen/toner.js";
import L from "leaflet";
import { leafletLayer } from "protomaps";
import "leaflet/dist/leaflet.css";
import "leaflet.sync/L.Map.Sync.js";

const GIT_SHA = (import.meta.env.VITE_GIT_SHA || "").substr(0, 8);

const DEMO_KEY = "1003762824b9687f"; // only works on gh-pages, get your own at https://protomaps.com
const VECTOR_TILES_URL =
  "https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=" + DEMO_KEY;

interface Option {
  name: string;
  type: string;
  fn?: () => L.Layer;
  url?: string;
  attribution?: string;
}

const OPTIONS: Option[] = [
  {
    name: "lightweight",
    type: "canvas",
    fn: () => {
      return leafletLayer({ url: VECTOR_TILES_URL });
    },
  },
  {
    name: "toner",
    type: "canvas",
    fn: () => {
      let [tasks, paint_rules, label_rules, attribution] = Toner("");
      return leafletLayer({
        url: VECTOR_TILES_URL,
        tasks: tasks,
        paint_rules: paint_rules,
        label_rules: label_rules,
        attribution: attribution,
      });
    },
  },
  {
    name: "toner-lite",
    type: "canvas",
    fn: () => {
      let [tasks, paint_rules, label_rules, attribution] = Toner("");
      return leafletLayer({
        url: VECTOR_TILES_URL,
        tasks: tasks,
        paint_rules: paint_rules,
        label_rules: label_rules,
        attribution: attribution,
      });
    },
  },
  {
    name: "osm-carto",
    type: "raster",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    name: "toner-raster",
    type: "raster",
    url: "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}@2x.png",
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  },
];

let setLayer = (map: L.Map, optionIdx: number) => {
  map.eachLayer((layer) => {
    map.removeLayer(layer);
  });
  let opt = OPTIONS[optionIdx];
  if (opt.type === "raster") {
    L.tileLayer(opt.url!, {
      attribution: opt.attribution,
    }).addTo(map);
  } else if (opt.type === "canvas") {
    let layer = opt.fn!();
    layer.addTo(map);
  }
};

function Compare(props: { closeCompare: () => void; leftMap: L.Map | null }) {
  var map = useRef<L.Map | null>(null);
  let mapRef = useRef<HTMLDivElement | null>(null);

  let [compare, setCompare] = useState<boolean>(false);
  let [selection, setSelection] = useState<number>(0);

  let onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection(+e.target.value);
  };

  useEffect(() => {
    map.current = L.map(mapRef.current!).setView([0, 0], 0);
    map.current.dragging.disable();
    (props.leftMap as any).sync(map.current);

    return () => {
      if (map.current) {
        (props.leftMap as any).unsync(map.current);
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map.current) setLayer(map.current, selection);
  }, [selection]);

  return (
    <div className="flex flex-column vh-100 w-50 bg-moon-gray">
      <div className="flex flex-grow-0 justify-between h3 items-center ph3">
        <span>
          <select onChange={onChange}>
            {OPTIONS.map((option, i) => (
              <option value={i} key={i}>
                {option.name}
              </option>
            ))}
          </select>
        </span>
        <span onClick={props.closeCompare} className="bg-white pointer dim pa1">
          close ⇥
        </span>
      </div>
      <div className="flex-grow h-100 flex" ref={mapRef}></div>
    </div>
  );
}

function App() {
  var map = useRef<L.Map | null>(null);
  let mapRef = useRef<HTMLDivElement | null>(null);

  let [compare, setCompare] = useState<boolean>(false);
  let [selection, setSelection] = useState<number>(0);

  let onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection(+e.target.value);
  };

  useEffect(() => {
    map.current = L.map(mapRef.current!).setView([0, 0], 0);

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current) setLayer(map.current, selection);
  }, [selection]);

  let leftClass = "flex flex-column vh-100 " + (compare ? "w-50" : "w-100");

  return (
    <div id="app" className="flex sans-serif">
      <div className={leftClass}>
        <div className="flex flex-grow-0 fw6 justify-between h3 items-center ph3">
          <span>protomaps-themes {GIT_SHA}</span>
          <span>
            <select onChange={onChange}>
              {OPTIONS.map((option, i) => (
                <option value={i} key={i}>
                  {option.name}
                </option>
              ))}
            </select>
          </span>
          <span>
            {!compare ? (
              <span
                onClick={() => {
                  setCompare(true);
                }}
                className="bg-moon-gray pointer dim pa1"
              >
                compare ⇤
              </span>
            ) : null}
          </span>
        </div>
        <div className="flex-grow h-100 flex" ref={mapRef}></div>
      </div>
      {compare ? (
        <Compare
          closeCompare={() => {
            setCompare(false);
          }}
          leftMap={map.current}
        />
      ) : null}
    </div>
  );
}

export default App;