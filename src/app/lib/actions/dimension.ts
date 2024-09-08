type DimensionCallback = (dimension: number) => void;

export const dimensionActions = {
  height: { callback: null as DimensionCallback | null, label: 'hauteur' },
  width: { callback: null as DimensionCallback | null, label: 'largeur' }
};

export function setDimensionCallbacks(
  heightCallback: DimensionCallback,
  widthCallback: DimensionCallback
) {
  dimensionActions.height.callback = heightCallback;
  dimensionActions.width.callback = widthCallback;
}