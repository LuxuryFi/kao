export type Payload = {
  email?: string;
  sub: number;
};

export type JWTDecodeValue = {
  iat: number;
  exp: number;
  iss?: string;
} & Payload;
