import { ValidationError } from "class-validator";

export function messageResponse(payload: { error: boolean; message: string }) {
  return {
    ...payload,
  };
}

export function authResponse(payload: {
  auth: boolean;
  message: string;
  token?: string;
}) {
  return {
    ...messageResponse({
      error: !payload.auth,
      message: payload.message,
    }),
    auth: payload.auth,
    token: payload.token,
  };
}

export function payloadResponse(payload: { data: any; message: string }) {
  return {
    ...messageResponse({
      error: false,
      message: payload.message,
    }),
    payload: payload.data,
  };
}

export function validationResponse(payload: {
  message: string;
  errors: ValidationError[];
}) {
  return {
    ...messageResponse({
      error: true,
      message: payload.message,
    }),
    errors: payload.errors.map((error) => {
      return {
        property: error.property,
        constraints: Object.values(error.constraints),
      };
    }),
  };
}
