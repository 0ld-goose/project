export interface Article {
  ObservedOrder: number;
  Title: string;
  UnixTimestamp: UnixTimestamp;
}

type UnixTimestamp = number;
