import { ApplicationError } from "@/protocols";

export function noPaid(): ApplicationError {
  return {
    name: "PaymentRequiredError",
    message: "Payment is required!",
  };
}
