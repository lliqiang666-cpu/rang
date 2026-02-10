
export interface Prize {
  id: string;
  name: string;
  ratio: number;
  color: string;
}

export interface SpinResult {
  prize: Prize;
  angle: number;
}
