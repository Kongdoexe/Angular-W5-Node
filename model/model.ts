export interface Movie {
  Mid: number;
  Title: string;
  type: string;
  year: number;
  runtime: string;
  Genre: string;
  detail: string;
  poster: string;
}

export interface Person {
  uid: number;
  name: string;
  type: string;
  detail: string;
  image: string;
  birthday: Date;
  mid: number;
}

export interface Object {
  sid: number;
  mid: number;
  uid: number;
}
