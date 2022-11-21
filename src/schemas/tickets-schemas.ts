import Joi from "joi";

export const createTicketsSchema = Joi.object<{ ticketTypeId: number }>({
  ticketTypeId: Joi.number().required(),
});
