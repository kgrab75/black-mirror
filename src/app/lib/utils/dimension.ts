import { stringToNumber } from "@/app/lib/utils";

export function validateDimension(dimension: string | number): number {
  return stringToNumber(dimension);
}

export function isDimensionValid(dimension: number): boolean {
  return !isNaN(dimension) && dimension >= 1;
}