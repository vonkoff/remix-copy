export interface Job {
  position: string;
  image: string[];
  employmentType: string;
  salary: string;
  benefits: string[];
  url: string;
  description: string;
  company: string;
  city: string;
  state: string;
  country: string;
  color: string;
}

export interface SessionImage {
  type: string;
  data: number[];
}
