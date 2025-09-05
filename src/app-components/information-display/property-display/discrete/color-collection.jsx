import { DiscreteColor } from "./discrete-color";
import { ColorLegend } from "../continuous/color-legend";

export function ColorCollection({ colorMap }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(colorMap).map(([category, color]) => (
          <DiscreteColor key={category} category={category} color={color} />
        ))}
      </div>
    </div>
  );
}
